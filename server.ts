import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { INITIAL_HOSPITALS, INITIAL_COHORTS, INITIAL_STATES, INITIAL_YATRAS } from './src/data/initialHospitals';
import { Hospital, TrainingCohort, StateLocation, YatraEvent, SATStatus, CallStatus } from './src/types';

interface TrackerDataStore {
  version: number;
  lastUpdated: string;
  updatedBy: string;
  hospitals: Hospital[];
  cohorts: TrainingCohort[];
  states: StateLocation[];
  yatras: YatraEvent[];
}

const STORAGE_FILE_PATH = path.join(process.cwd(), 'server_tracker_data.json');
const PORT = 3000;

// Initialize data store with default satStatus if missing
function enrichHospitalsWithSat(rawHospitals: Hospital[]): Hospital[] {
  return rawHospitals.map((h, idx) => {
    let sat: SATStatus = h.satStatus || 'SAT not filled';
    if (!h.satStatus) {
      if (h.callStatus === 'Won' || h.callStatus === 'Application in progress') {
        sat = 'SAT completed';
      } else if (h.yatraEventAttended) {
        sat = idx % 3 === 0 ? 'SAT completed' : idx % 3 === 1 ? 'SAT filled partially' : 'SAT not filled';
      } else if (h.callStatus === 'Hot' || h.callStatus === 'Warm') {
        sat = idx % 2 === 0 ? 'SAT filled partially' : 'SAT not filled';
      } else {
        sat = 'SAT not filled';
      }
    }
    return {
      ...h,
      satStatus: sat
    };
  });
}

function loadInitialStore(): TrackerDataStore {
  try {
    if (fs.existsSync(STORAGE_FILE_PATH)) {
      const fileData = fs.readFileSync(STORAGE_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(fileData);
      if (parsed && Array.isArray(parsed.hospitals)) {
        return {
          version: parsed.version || 1,
          lastUpdated: parsed.lastUpdated || new Date().toISOString(),
          updatedBy: parsed.updatedBy || 'System',
          hospitals: enrichHospitalsWithSat(parsed.hospitals),
          cohorts: Array.isArray(parsed.cohorts) ? parsed.cohorts : INITIAL_COHORTS,
          states: Array.isArray(parsed.states) ? parsed.states : INITIAL_STATES,
          yatras: Array.isArray(parsed.yatras) ? parsed.yatras : INITIAL_YATRAS
        };
      }
    }
  } catch (err) {
    console.error('Failed to read existing store file, falling back to initial data', err);
  }

  const initialStore: TrackerDataStore = {
    version: 1,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'System Init',
    hospitals: enrichHospitalsWithSat(INITIAL_HOSPITALS),
    cohorts: INITIAL_COHORTS,
    states: INITIAL_STATES,
    yatras: INITIAL_YATRAS
  };

  try {
    fs.writeFileSync(STORAGE_FILE_PATH, JSON.stringify(initialStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write initial store file', err);
  }

  return initialStore;
}

let store: TrackerDataStore = loadInitialStore();

// List of connected SSE clients for real-time live push
interface SseClient {
  id: string;
  res: express.Response;
}
const sseClients: SseClient[] = [];

function broadcastUpdate(actionSummary: string, updatedBy: string) {
  const payload = JSON.stringify({
    type: 'sync',
    version: store.version,
    lastUpdated: store.lastUpdated,
    updatedBy,
    actionSummary,
    hospitals: store.hospitals,
    cohorts: store.cohorts,
    states: store.states,
    yatras: store.yatras,
    data: {
      hospitals: store.hospitals,
      cohorts: store.cohorts,
      states: store.states,
      yatras: store.yatras
    }
  });

  for (let i = sseClients.length - 1; i >= 0; i--) {
    const client = sseClients[i];
    try {
      client.res.write(`event: sync\ndata: ${payload}\n\n`);
    } catch {
      sseClients.splice(i, 1);
    }
  }
}

function saveStore(updatedBy: string, actionSummary: string) {
  store.version += 1;
  store.lastUpdated = new Date().toISOString();
  store.updatedBy = updatedBy;

  try {
    fs.writeFileSync(STORAGE_FILE_PATH, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist store to disk', err);
  }

  broadcastUpdate(actionSummary, updatedBy);
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '25mb' }));

  // Enable CORS for all requests so any remote client / shared link / preview can sync
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // ================= API ROUTES =================

  // 1. Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      version: store.version,
      connectedClients: sseClients.length,
      lastUpdated: store.lastUpdated
    });
  });

  // 2. Fetch full tracker data
  app.get('/api/tracker', (req, res) => {
    res.json({
      version: store.version,
      lastUpdated: store.lastUpdated,
      updatedBy: store.updatedBy,
      connectedClients: sseClients.length,
      hospitals: store.hospitals,
      cohorts: store.cohorts,
      states: store.states,
      yatras: store.yatras
    });
  });

  // 2b. Lightweight version check for high-frequency polling
  app.get('/api/tracker/version', (req, res) => {
    res.json({
      version: store.version,
      lastUpdated: store.lastUpdated,
      totalHospitals: store.hospitals.length,
      wonCount: store.hospitals.filter((h) => h.callStatus === 'Won').length,
      totalYatras: store.yatras.length
    });
  });

  // 3. Handler for full state sync (handles both /api/tracker/sync and /api/tracker/update)
  const handleStateSync = (req: express.Request, res: express.Response) => {
    const { hospitals, cohorts, states, yatras, updatedBy, actionSummary } = req.body;

    if (Array.isArray(hospitals)) {
      store.hospitals = hospitals;
    }
    if (Array.isArray(cohorts)) {
      store.cohorts = cohorts;
    }
    if (Array.isArray(states)) {
      store.states = states;
    }
    if (Array.isArray(yatras)) {
      store.yatras = yatras;
    }

    const author = updatedBy || 'Team Member';
    const summary = actionSummary || 'Synchronized tracker data';
    saveStore(author, summary);

    res.json({
      success: true,
      version: store.version,
      lastUpdated: store.lastUpdated,
      hospitalsCount: store.hospitals.length,
      yatrasCount: store.yatras.length,
      wonCount: store.hospitals.filter((h) => h.callStatus === 'Won').length
    });
  };

  app.post('/api/tracker/sync', handleStateSync);
  app.post('/api/tracker/update', handleStateSync);

  // 4. Quick SAT Status Update (Direct single-click updates from pipeline)
  app.post('/api/tracker/quick-sat', (req, res) => {
    const { hospitalId, satStatus, updatedBy } = req.body;
    if (!hospitalId || !satStatus) {
      return res.status(400).json({ error: 'hospitalId and satStatus required' });
    }

    let targetName = 'Hospital';
    let oldSat = '';

    store.hospitals = store.hospitals.map((h) => {
      if (h.id === hospitalId) {
        targetName = h.organisation;
        oldSat = h.satStatus || 'SAT not filled';
        const satRemark = {
          id: `rem-sat-${Date.now()}`,
          date: new Date().toISOString(),
          author: updatedBy || 'Advisor',
          callStatus: h.callStatus,
          remark: `SAT Filling Status updated to "${satStatus}" (was "${oldSat}").`,
          channel: 'Phone Call',
          tags: ['SAT Status']
        };

        return {
          ...h,
          satStatus: satStatus as SATStatus,
          satUpdatedDate: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          remarks: [satRemark, ...(h.remarks || [])]
        };
      }
      return h;
    });

    const author = updatedBy || 'Team Advisor';
    const summary = `Updated SAT status for ${targetName} to "${satStatus}"`;
    saveStore(author, summary);

    res.json({
      success: true,
      version: store.version,
      lastUpdated: store.lastUpdated,
      hospital: store.hospitals.find((h) => h.id === hospitalId)
    });
  });

  // 5. Quick Call Status Update
  app.post('/api/tracker/quick-status', (req, res) => {
    const { hospitalId, callStatus, updatedBy } = req.body;
    if (!hospitalId || !callStatus) {
      return res.status(400).json({ error: 'hospitalId and callStatus required' });
    }

    let targetName = 'Hospital';
    store.hospitals = store.hospitals.map((h) => {
      if (h.id === hospitalId) {
        targetName = h.organisation;
        const newRemark = {
          id: `rem-quick-${Date.now()}`,
          date: new Date().toISOString(),
          author: updatedBy || 'Advisor',
          callStatus: callStatus as CallStatus,
          remark: `Quick status updated to "${callStatus}".`,
          channel: 'Phone Call'
        };
        return {
          ...h,
          callStatus: callStatus as CallStatus,
          updatedAt: new Date().toISOString(),
          remarks: [newRemark, ...(h.remarks || [])]
        };
      }
      return h;
    });

    const author = updatedBy || 'Team Advisor';
    const summary = `Updated ${targetName} stage to "${callStatus}"`;
    saveStore(author, summary);

    res.json({
      success: true,
      version: store.version,
      lastUpdated: store.lastUpdated
    });
  });

  // 5b. Yatra Endpoints (Atomic CRUD)
  // Create Yatra
  app.post('/api/tracker/yatras', (req, res) => {
    const newYatra: YatraEvent = {
      ...req.body,
      id: req.body.id || `yatra-${Date.now()}`
    };
    store.yatras = [newYatra, ...store.yatras.filter(y => y.id !== newYatra.id)];
    saveStore(req.body.updatedBy || 'Team Member', `Created Yatra "${newYatra.title}" in ${newYatra.city}`);
    res.json({ success: true, version: store.version, yatra: newYatra, yatras: store.yatras });
  });

  // Edit Yatra
  app.put('/api/tracker/yatras/:id', (req, res) => {
    const yatraId = req.params.id;
    const updatedYatra: YatraEvent = req.body;
    store.yatras = store.yatras.map(y => y.id === yatraId ? { ...y, ...updatedYatra } : y);
    saveStore(req.body.updatedBy || 'Team Member', `Updated Yatra "${updatedYatra.title || yatraId}"`);
    res.json({ success: true, version: store.version, yatra: updatedYatra, yatras: store.yatras });
  });

  // Delete Yatra
  app.delete('/api/tracker/yatras/:id', (req, res) => {
    const yatraId = req.params.id;
    const targetYatra = store.yatras.find(y => y.id === yatraId);
    store.yatras = store.yatras.filter(y => y.id !== yatraId);

    // Unlink from hospitals
    if (targetYatra) {
      store.hospitals = store.hospitals.map(h => {
        if (targetYatra.hospitalIds && targetYatra.hospitalIds.includes(h.id)) {
          return {
            ...h,
            yatraEventAttended: false,
            yatraEventDate: undefined,
            yatraCity: undefined,
            yatraEventName: undefined
          };
        }
        return h;
      });
    }

    saveStore('Team Member', `Deleted Yatra "${targetYatra?.title || yatraId}"`);
    res.json({ success: true, version: store.version, deletedId: yatraId, yatras: store.yatras });
  });

  // Assign hospitals to Yatra
  app.post('/api/tracker/yatras/:id/assign', (req, res) => {
    const yatraId = req.params.id;
    const { hospitalIds } = req.body;
    const targetYatra = store.yatras.find(y => y.id === yatraId);

    if (!targetYatra || !Array.isArray(hospitalIds)) {
      return res.status(400).json({ error: 'Invalid yatraId or hospitalIds' });
    }

    const updatedHospitalIds = Array.from(new Set([...(targetYatra.hospitalIds || []), ...hospitalIds]));
    store.yatras = store.yatras.map(y => y.id === yatraId ? { ...y, hospitalIds: updatedHospitalIds } : y);

    // Link hospitals
    store.hospitals = store.hospitals.map(h => {
      if (hospitalIds.includes(h.id)) {
        return {
          ...h,
          yatraEventAttended: true,
          yatraCity: targetYatra.city,
          yatraEventDate: targetYatra.date,
          yatraEventName: targetYatra.title
        };
      }
      return h;
    });

    saveStore('Team Member', `Mapped ${hospitalIds.length} hospital(s) to Yatra "${targetYatra.title}"`);
    res.json({ success: true, version: store.version, yatra: store.yatras.find(y => y.id === yatraId) });
  });

  // 6. Reset database
  app.post('/api/tracker/reset', (req, res) => {
    store = {
      version: store.version + 1,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'Admin Reset',
      hospitals: enrichHospitalsWithSat(INITIAL_HOSPITALS),
      cohorts: INITIAL_COHORTS,
      states: INITIAL_STATES,
      yatras: INITIAL_YATRAS
    };

    try {
      fs.writeFileSync(STORAGE_FILE_PATH, JSON.stringify(store, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write reset store', err);
    }

    broadcastUpdate('Restored initial default dataset', 'Admin');

    res.json({
      success: true,
      version: store.version,
      lastUpdated: store.lastUpdated
    });
  });

  // 7. Server-Sent Events (SSE) for Real-Time Multi-User Push
  app.get('/api/tracker/stream', (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    });

    const clientId = `client-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newClient: SseClient = { id: clientId, res };
    sseClients.push(newClient);

    // Send initial handshake with full dataset
    res.write(`event: init\ndata: ${JSON.stringify({
      version: store.version,
      lastUpdated: store.lastUpdated,
      connectedClients: sseClients.length,
      clientId,
      hospitals: store.hospitals,
      cohorts: store.cohorts,
      states: store.states,
      yatras: store.yatras,
      data: {
        hospitals: store.hospitals,
        cohorts: store.cohorts,
        states: store.states,
        yatras: store.yatras
      }
    })}\n\n`);

    // Keep connection alive with heartbeat comments every 15s
    const heartbeat = setInterval(() => {
      try {
        res.write(`: heartbeat\n\n`);
      } catch {
        clearInterval(heartbeat);
      }
    }, 15000);

    req.on('close', () => {
      clearInterval(heartbeat);
      const idx = sseClients.findIndex((c) => c.id === clientId);
      if (idx !== -1) {
        sseClients.splice(idx, 1);
      }
    });
  });

  // ================= VITE MIDDLEWARE SETUP =================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Yatra Server] Real-time Multi-User Server running on port ${PORT}`);
  });
}

startServer();
