import { Hospital, TrainingCohort, StateLocation, YatraEvent } from '../types';

interface RawRow {
  org: string;
  fn: string;
  ln: string;
  mob: string;
  status: string;
  cat: string;
  exp: string;
  urg: string;
  rem: string;
}

const RAW_DATA: RawRow[] = [
  { org: "24x7 Rudraksh Multispeciality Hospital", fn: "Nitu", ln: "Panwar", mob: "9009920970", status: "Engaged", cat: "Certified", exp: "19-01-2028", urg: "Expiring > 1 year", rem: "Disconnected the call saying he is busy" },
  { org: "Aadhaar Hospital multi speciality unit Bhopal", fn: "Son Singh", ln: "Yadav", mob: "8120720303", status: "Cold", cat: "Certified", exp: "28-05-2024", urg: "ALREADY EXPIRED", rem: "Did not respond" },
  { org: "AAYU HOSPITAL AND TRAUMA CENTRE", fn: "Hariom", ln: "Paliwal", mob: "8349663311", status: "Hot", cat: "Certified", exp: "20-04-2028", urg: "Expiring > 1 year", rem: "Plans to apply within 2-3 months" },
  { org: "ADVANCE HOSPITAL,BHOPAL", fn: "DR MOHAMMAD AYYUB KHAN", ln: "Khan", mob: "9753504534", status: "Hot", cat: "Certified", exp: "19-05-2027", urg: "Expiring 181-365 days", rem: "Plans to apply in September, do not require any handholding everything is going smooth on their end" },
  { org: "Aggrawal's Bombay Children Hospital", fn: "Anuj", ln: "Gangrade", mob: "9827342424", status: "Engaged", cat: "Certified", exp: "15-09-2022", urg: "ALREADY EXPIRED", rem: "Rejected the call" },
  { org: "Ak nursing home", fn: "Syed", ln: "Muskan", mob: "7898799360", status: "Warm", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "Will plan to apply after 6-7 months.No handholding required currently." },
  { org: "Alam Multicare Hospital", fn: "Dr. Faizan", ln: "Alam", mob: "9131000244", status: "Hot", cat: "Certified", exp: "30-03-2028", urg: "Expiring > 1 year", rem: "Did not respond" },
  { org: "Anantcare Multispeciality hospital", fn: "Rohan", ln: "Sahu", mob: "8878070063", status: "Warm", cat: "Certified", exp: "01-06-2028", urg: "Expiring > 1 year", rem: "Did not respond" },
  { org: "ANKUR MATERNITY AND NURSING HOME", fn: "ANUBHAV", ln: "GOEL", mob: "9229225037", status: "Engaged", cat: "Not Yet Certified/Accredited", exp: "23-09-2021", urg: "", rem: "Disconnected the call" },
  { org: "anwita hospital", fn: "Surekha", ln: "maniram", mob: "9425011045", status: "Cold", cat: "Certified", exp: "02-02-2028", urg: "Expiring > 1 year", rem: "ELC done 6 months ago only, plans to apply once it will expire" },
  { org: "Apex Hospital", fn: "SUNIL", ln: "TALREJA", mob: "9826759009", status: "Won", cat: "Accredited", exp: "15-09-2026", urg: "Expiring <= 90 days", rem: "" },
  { org: "Apple children's hospital", fn: "MANOJ", ln: "SHARMA", mob: "8269933404", status: "Cold", cat: "Certified", exp: "22-12-2028", urg: "ALREADY EXPIRED", rem: "QC completed" },
  { org: "ARADHANA MATERNITY AND KIDNEY HOSPITAL", fn: "swatantra", ln: "dubey", mob: "8959640889", status: "Hot", cat: "Certified", exp: "11-08-2027", urg: "Expiring > 1 year", rem: "Did not respond" },
  { org: "ARADHYA MULTISPECIALITY HOSPITAL", fn: "Dr Rupesh", ln: "Pandey", mob: "9826371854", status: "Engaged", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "Did not respond" },
  { org: "Arera trauma and critical care hospital", fn: "Rajiv", ln: "Parolkar", mob: "9111290798", status: "Won", cat: "Certified", exp: "15-09-2026", urg: "Expiring <= 90 days", rem: "" },
  { org: "Arpan nerta and prasuti sewa hospital", fn: "Sunil", ln: "Kumar", mob: "9713135103", status: "Cold", cat: "Certified", exp: "08-12-2027", urg: "Expiring > 1 year", rem: "They have got their ELC done few months back. Will plan once it is expired" },
  { org: "Asg eye hospital bhopal", fn: "ANCHAL", ln: "SAHU", mob: "7771039336", status: "Cold", cat: "Certified", exp: "10-12-2028", urg: "", rem: "" },
  { org: "ASHAPUNJ FERTILITY & GYNAECOLOGY CENTRE", fn: "Dr teena", ln: "Gupta", mob: "97425607100", status: "Engaged", cat: "Certified", exp: "11-12-2025", urg: "ALREADY EXPIRED", rem: "Did not respond" },
  { org: "Ashoka ivf care and multi-speciality hospital", fn: "Shahid", ln: "Khan", mob: "7047996492", status: "Hot", cat: "Certified", exp: "02-11-2024", urg: "ALREADY EXPIRED", rem: "Preparation is going on. No handholding required" },
  { org: "ASIAN MULTISPECIALITY HOSPITAL", fn: "DR RAMKISHORE DIXIT", ln: "KHAN", mob: "7225025130", status: "Application in progress", cat: "Certified", exp: "05-05-2027", urg: "Expiring 181-365 days", rem: "" },
  { org: "Atal Multispeciality hospital", fn: "Abhishek", ln: "Sharma", mob: "9893461099", status: "Engaged", cat: "Not Yet Certified/Accredited", exp: "03-06-2026", urg: "ALREADY EXPIRED", rem: "Did not respond" },
  { org: "Balaji children hospital", fn: "Vaseem", ln: "Mansoori", mob: "6261034769", status: "Hot", cat: "Certified", exp: "11-05-2028", urg: "Expiring > 1 year", rem: "The Hospital is already nabh Entry Leval Certified.planing to start the process for nabh full Accreditation after 01 months." },
  { org: "BALAJI FRACTURE AND GENERAL HOSPITAL", fn: "Prashant", ln: "", mob: "7000093234", status: "Cold", cat: "Certified", exp: "14-04-2028", urg: "Expiring > 1 year", rem: "ELC just got renewed in May, hence plans to apply after this will get expired" },
  { org: "Berasia general hospital", fn: "Gopal", ln: "Meena", mob: "8269227413", status: "Cold", cat: "Certified", exp: "09-03-2024", urg: "ALREADY EXPIRED", rem: "They have got their ELC done back in May 2026. Hence will plan to apply after 1 year" },
  { org: "Bhopal Children and Multispeciality Hospital", fn: "Rajesh", ln: "Chandrakapure", mob: "8962923108", status: "Hot", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "Preparations are undergoing, they plan to apply within 2-3 months. No hand holding required currently" },
  { org: "Bhopal hospital and research centre", fn: "Aarti", ln: "Hariyale", mob: "9039207365", status: "Won", cat: "Accreditation under process", exp: "", urg: "", rem: "" },
  { org: "Bhopal multi-speciality Hospital", fn: "Sheehan", ln: "Saif", mob: "7000638599", status: "Engaged", cat: "Not Yet Certified/Accredited", exp: "12-04-2027", urg: "", rem: "Did not respond" },
  { org: "Birla Fertility & IVF - A Unit of CK BIRLA HEALTHCARE PVT LTD", fn: "Mahesh", ln: "Dangi", mob: "6263648557", status: "Cold", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "Nither certified nor accredited. No plans to apply currently, no specific reason given." },
  { org: "BISONIYA HOSPITAL MATERNITY AND PLASTIC SURGERY", fn: "Dr Nidhi", ln: "Singh", mob: "9669466444", status: "Engaged", cat: "Certified", exp: "19-05-2027", urg: "Expiring 181-365 days", rem: "Did not respond" },
  { org: "Care And Cure Multispeciality Hospital", fn: "Shaaz", ln: "Khan", mob: "9165182646", status: "Application in progress", cat: "Accreditation under process", exp: "", urg: "ALREADY EXPIRED", rem: "" },
  { org: "CARE INFINITY HOSPITAL", fn: "Kajal", ln: "Kishnani", mob: "8871271641", status: "Application in progress", cat: "Certified", exp: "01-12-2022", urg: "ALREADY EXPIRED", rem: "The hospital is already NABH Entry Level Certified. applied for NABH Full Accreditation in May 2026, and our application is currently in progress." },
  { org: "CAREWELL MULTISPECIALITY HOSPITAL", fn: "Rajkumar", ln: "Panwar", mob: "9993447427", status: "Existing", cat: "Accredited", exp: "15-07-2030", urg: "Expiring 181-365 days", rem: "" },
  { org: "CENTRAL HOSPITAL IVF, LAPAROSCOPY AND MATERNITY CENTRE", fn: "DR IRAM AIJAZ", ln: "hasan", mob: "8817122138", status: "Cold", cat: "Certified", exp: "09-09-2026", urg: "Expiring <= 90 days", rem: "Facing budget issues and modular OT issue. They are planning to get the ELC renewal done. No plans for NABH full accreditation currently" },
  { org: "CHARAK HOSPITAL AND RESEARCH CENTRE", fn: "HEMANT", ln: "KUSHWAH", mob: "9238343810", status: "Engaged", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "He is not the decision-maker provided the concern person's number. Dr Anil 9826075272." },
  { org: "Chirag children hospital", fn: "Dr minhaj uddin", ln: "Ahmed", mob: "7697744257", status: "Won", cat: "Accreditation under process", exp: "", urg: "Expiring 91-180 days", rem: "" },
  { org: "CITY CARE HOSPITAL", fn: "Raees", ln: "Khan", mob: "9993084671", status: "Hot", cat: "Certified", exp: "11-08-2027", urg: "Expiring > 1 year", rem: "Started the preparation, plans to apply in 2 months. No handholding required currently" },
  { org: "CORPORATE HEALTHCARE HOSPITAL", fn: "DR MANOJ", ln: "VISHWAKARMA", mob: "8770582860", status: "Hot", cat: "Certified", exp: "14-07-2028", urg: "Expiring > 1 year", rem: "Preparation are undergoing, waiting for some internal approvals. Will apply in 2-3 months no handholding required" },
  { org: "DEEPSHIKHA MULTISPECIALITY HOSPITAL", fn: "Sandeep", ln: "Rajput", mob: "8120295563", status: "Won", cat: "Accreditation under process", exp: "", urg: "Expiring 181-365 days", rem: "" },
  { org: "Dev Mata hospital", fn: "Vinod", ln: "Shivhare", mob: "9981972456", status: "Cold", cat: "Certified", exp: "27-04-2028", urg: "Expiring > 1 year", rem: "" },
  { org: "DIVYANKA CHILDREN HOSPITAL", fn: "Dr. Rajendra", ln: "machhiwal", mob: "8319490761", status: "Warm", cat: "Certified", exp: "02-06-2027", urg: "Expiring 181-365 days", rem: "Did not respond" },
  { org: "Dks Hospital Multispeciality Trauma And Critical Care Centre", fn: "DR POONAM", ln: "KHEMCHANDANI", mob: "9893595276", status: "Existing", cat: "Accredited", exp: "10-12-2029", urg: "", rem: "" },
  { org: "Dolphin children hospital", fn: "Mohammad", ln: "Shanawaz", mob: "7693872799", status: "Hot", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "Plans to apply after 1-2 months. Preparations are undergoing. No handholding required currently" },
  { org: "Dr. Jaiswal multispecialty", fn: "Umesh", ln: "Sharma", mob: "7350398235", status: "Engaged", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "Call is not going through" },
  { org: "Dulaar children hospital", fn: "Shubham", ln: "Gupta", mob: "8889137143", status: "Hot", cat: "Certified", exp: "05-08-2026", urg: "ALREADY EXPIRED", rem: "They have got their ELC done 2-3 months ago, waiting for certificate. Talk regarding full accreditation is under process with Director, plans to apply within 6 months. Handholding required" },
  { org: "Ekta hi tech hospital karond", fn: "Mr.sunil kumar", ln: "Mehar", mob: "9754936865", status: "Engaged", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "Did not respond" },
  { org: "Empire multi speciality hospital", fn: "Abdullah", ln: "Khan", mob: "9179746312", status: "Hot", cat: "Certified", exp: "03-01-2024", urg: "ALREADY EXPIRED", rem: "Did not respond" },
  { org: "GANPATI HOSPITAL", fn: "Deepak Kumar", ln: "Pandey", mob: "8818925941", status: "Hot", cat: "Certified", exp: "28-07-2027", urg: "Expiring 181-365 days", rem: "Did not respond" },
  { org: "Gastrocare Multi Specialty Hospital", fn: "Mahesh", ln: "Sable", mob: "7566633003", status: "Cold", cat: "Certified", exp: "01-07-2026", urg: "ALREADY EXPIRED", rem: "Did not respond" },
  { org: "Gayatri Multispeciality hospital", fn: "Devesh", ln: "Vyas", mob: "7987708602", status: "Existing", cat: "Accredited", exp: "29-01-2030", urg: "", rem: "" },
  { org: "GAYATRI SWAROOP HOSPITAL", fn: "Chirag", ln: "Dausage", mob: "9479378666", status: "Cold", cat: "Certified", exp: "29-09-2027", urg: "Expiring > 1 year", rem: "He said that the owner is currently out of India, once he will be back after 3 months then they will decide and plan" },
  { org: "GOODWILL HOSPITAL", fn: "Dr Akram", ln: "", mob: "9993420548", status: "Hot", cat: "Certified", exp: "25-05-2024", urg: "ALREADY EXPIRED", rem: "Plans to apply after 1-2 months. No handholding required currently" },
  { org: "H P eye and retina care", fn: "Amit", ln: "Srivastava", mob: "7869424356", status: "Cold", cat: "Certified", exp: "24-03-2027", urg: "Expiring 181-365 days", rem: "Preparations are undergoing, but they have some changes going on for modular OT. Will apply by next year" },
  { org: "Hardev hospital Bairagarh", fn: "Vikram", ln: "Meena", mob: "7987335015", status: "Engaged", cat: "Certified", exp: "09-03-2028", urg: "", rem: "ELCP-26-004241, DA pending" },
  { org: "Harmony Institute of excellence in Reproductive Health (HER HEALTH)", fn: "Dr Shashi", ln: "Thakur", mob: "9343407448", status: "Hot", cat: "Certified", exp: "24-11-2027", urg: "Expiring > 1 year", rem: "Did not respond" },
  { org: "HAYAT MULTISPECIALTY HOSPITAL", fn: "ZAIN", ln: "UDDIN", mob: "9893312633", status: "Existing", cat: "Accredited", exp: "26-05-2030", urg: "Expiring 181-365 days", rem: "" },
  { org: "Health city hospital", fn: "Neeraj", ln: "Vishwakarma", mob: "9617770444", status: "Application in progress", cat: "Certified", exp: "27-04-2024", urg: "ALREADY EXPIRED", rem: "Call 1(29 July 26)Avi- Informed me that they are uploading their documents and in process stage." },
  { org: "HIND HOPE HOSPITAL", fn: "DR SIDDHARTHA SAGAR", ln: "Sagar", mob: "8085853886", status: "Cold", cat: "Certified", exp: "04-08-2027", urg: "Expiring 181-365 days", rem: "Did not respond" },
  { org: "Hi-Tech Eye Care and Laser Centre", fn: "Tejmani", ln: "Kushwaha", mob: "9039550526", status: "Hot", cat: "Certified", exp: "07-10-2026", urg: "Expiring <= 90 days", rem: "Did not respond" },
  { org: "Huda hospital", fn: "Dr Azher", ln: "Baig", mob: "8878895095", status: "Hot", cat: "Certified", exp: "09-03-2028", urg: "Expiring > 1 year", rem: "Have started the preparation, some internal discussions are going on regarding the speciality. Plans to apply after 2-3 months. Needs handholding" },
  { org: "I max Retina and eye Care", fn: "Hemant", ln: "Chourasiya", mob: "8269596887", status: "Lost", cat: "Certified", exp: "23-03-2028", urg: "Expiring > 1 year", rem: "Invalid number" },
  { org: "Ies hospital and research centre", fn: "manek", ln: "waghmare", mob: "8830939028", status: "Hot", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "Building just got completed few months back hence planning to apply for ELC. Preparing documents, no handholding required currently." },
  { org: "IES Hospital and Research Centre Bhopal", fn: "Sachin", ln: "Khedikar", mob: "919961000000", status: "Hot", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "Did not respond" },
  { org: "International hospital A unit of JDS medical and allied services", fn: "Milraj", ln: "Hajare", mob: "8982978909", status: "Cold", cat: "Certified", exp: "13-05-2028", urg: "", rem: "No plans to apply currently. No reasons given & disconnected the call.ELCP-26-001789, OA pending" },
  { org: "Ish kripa Fertility Endoscopy Center IVF Center Bhopal", fn: "Tabassum", ln: "Shaikh", mob: "7610613176", status: "Engaged", cat: "Certified", exp: "23-02-2028", urg: "Expiring > 1 year", rem: "Did not respond" },
  { org: "J k super speciality hospital", fn: "Shagufta alam", ln: "khan", mob: "9826525929", status: "Existing", cat: "Accredited", exp: "19-08-2030", urg: "", rem: "JK superspeciality is same as JK hospital, and for which OA has been done this month" },
  { org: "Jaanki Hospital", fn: "Shubham", ln: "Patidar", mob: "7415195296", status: "Existing", cat: "Accredited", exp: "23-07-2030", urg: "Expiring <= 90 days", rem: "" },
  { org: "Jashdeep hospital", fn: "Rajeev", ln: "Gour", mob: "9977301987", status: "Existing", cat: "Certified", exp: "19-08-2026", urg: "Expiring <= 90 days", rem: "The Hospital is already nabh Entry Leval Certified.there is currently no planning regarding NABH Accreditation." },
  { org: "Jayshree Hospital", fn: "Saurabh", ln: "Beedkar", mob: "9958800228", status: "Hot", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "Rejected the call" },
  { org: "Jeevan multispeciality hospital &trauma center", fn: "Sachin", ln: "Meena", mob: "9713969023", status: "Engaged", cat: "Certified", exp: "24-11-2027", urg: "Expiring > 1 year", rem: "Did not respond" },
  { org: "Jeevan multispecilty", fn: "Abhishek", ln: "Meena", mob: "7987791715", status: "Engaged", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "Did not respond" },
  { org: "Jeevan Shri hospital", fn: "Shishupal Patel", ln: "Patel", mob: "7987378984", status: "Engaged", cat: "Certified", exp: "28-07-2027", urg: "", rem: "Did not respond" },
  { org: "JEEVANDAAN MULTISPECIALITY HOSPITAL", fn: "Raja", ln: "Choudhary", mob: "9079036458", status: "Existing", cat: "Accredited", exp: "13-05-2030", urg: "", rem: "" },
  { org: "Jeevandan multicare hospital", fn: "Sunil", ln: "Parmeshwariya", mob: "8839808687", status: "Engaged", cat: "Certified", exp: "28-11-2026", urg: "", rem: "Did not respond" },
  { org: "JK Hospital & LN Medical College Bhopal", fn: "Rituja", ln: "Kaushal", mob: "8989648737", status: "Application in progress", cat: "Accredited", exp: "15-06-2026", urg: "", rem: "" },
  { org: "KANHA MATERNITY & CHILD CARE HOSPITAL", fn: "Dilshad", ln: "Ansari", mob: "8319374945", status: "Warm", cat: "Certified", exp: "14-01-2027", urg: "Expiring 91-180 days", rem: "Plans to apply after 6 months. ELC is currently valid" },
  { org: "Karma Devi Multispeciality Hospital", fn: "Ayush", ln: "Sahu", mob: "7581089837", status: "Hot", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "Preparing the documents, plans to apply within 1-2 months. No handholding required currently" },
  { org: "Kid kare Hospital", fn: "Dr V.M.Sanjay", ln: "Rajput", mob: "9617266498", status: "Hot", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "Plans to apply after 1-2 months. Handholding required currently as they have many queries." },
  { org: "KISHNANI HOSPITAL", fn: "Kuldeep", ln: "Jhala", mob: "7389326311", status: "Won", cat: "Accreditation under process", exp: "16-08-2025", urg: "ALREADY EXPIRED", rem: "" },
  { org: "KNP hospital", fn: "Dr Sanjeev singh", ln: "Chandel", mob: "7000591830", status: "Existing", cat: "Certified", exp: "22-09-2027", urg: "", rem: "" },
  { org: "KRIPASHREE HOSPITAL", fn: "Dr vakeel", ln: "Khan", mob: "9827391789", status: "Hot", cat: "Certified", exp: "16-03-2028", urg: "Expiring > 1 year", rem: "Disconnected the call" },
  { org: "Krishna Hospital", fn: "Kripansh", ln: "Dubey", mob: "7987864617", status: "Cold", cat: "Certified", exp: "07-08-2025", urg: "ALREADY EXPIRED", rem: "He said that his sister is the decision maker, asked for the number 9074669993 (Jyoti), called her but she did not respond" },
  { org: "KRISHNA MULTISPECIALITY HOSPITAL AND TRAUMA CENTRE", fn: "SACHIN THAKRE", ln: "THAKRE", mob: "9826588443", status: "Hot", cat: "Certified", exp: "07-08-2025", urg: "ALREADY EXPIRED", rem: "Plans to aply after 1-2 months. Do not require handholding currently" },
  { org: "KUSHA BHAU THAKRE NURSING COLLEGE AND HOSPITAL", fn: "Sanjay", ln: "Dubey", mob: "9827014765", status: "Hot", cat: "Certified", exp: "23-06-2027", urg: "Expiring 181-365 days", rem: "Preparations have started, plans to apply after 2-3 months. No handholding required currently." },
  { org: "LAHOTI HOSPITAL AND RESEARCH CENTRE", fn: "DEENDAYAL", ln: "GUPTA", mob: "9522261205", status: "Engaged", cat: "Certified", exp: "18-08-2027", urg: "Expiring > 1 year", rem: "Switched off" },
  { org: "Lakecity institute of surgical sciences", fn: "Manish kumar", ln: "Saxena", mob: "9753885569", status: "Hot", cat: "Certified", exp: "12-05-2027", urg: "Expiring 181-365 days", rem: "Did not respond" },
  { org: "Lakshya multi-speciality hospital", fn: "Nikita", ln: "Bairagi", mob: "7697942376", status: "Existing", cat: "Accredited", exp: "09-12-2029", urg: "ALREADY EXPIRED", rem: "" },
  { org: "Laxmi MULTISPECIALITY hospital", fn: "Deepak", ln: "Lodhi", mob: "8817820508", status: "Existing", cat: "Certified", exp: "11-05-2024", urg: "ALREADY EXPIRED", rem: "Call 1: Akanksha (29/07/26): Already applied in the month of May. Desktop NCs are inn progress" },
  { org: "LBS hospital Bhopal", fn: "Mr Praphull", ln: "Giri", mob: "9179075535", status: "Existing", cat: "Accredited", exp: "26-12-2030", urg: "", rem: "Already applied in April 2026, NC closure is undergoing" },
  { org: "lifeline hospital", fn: "Dr Shrikant", ln: "Jain", mob: "9826093633", status: "Hot", cat: "Certified", exp: "17-03-2027", urg: "Expiring 181-365 days", rem: "Preparations are undergoing, plans to apply within 1-2 month, no handholding required currently." },
  { org: "LILAWATI HOSPITAL", fn: "Sohan", ln: "Singh", mob: "7000327492", status: "Cold", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "" },
  { org: "Lord Buddha Hospital", fn: "Dr. Krishna Kumar", ln: "Suryawanshi", mob: "9826871022", status: "Cold", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "Did not respond" },
  { org: "MAA PITAMBARA MULTISPECIALITY HOSPITAL", fn: "RABBINA TAMU SHRIVASTAVA", ln: "Shrivastava", mob: "9174756365", status: "Existing", cat: "Accredited", exp: "22-09-2030", urg: "Expiring > 1 year", rem: "" },
  { org: "Maan Hospital", fn: "Prashant", ln: "Deshpande", mob: "9425381588", status: "Existing", cat: "Accredited", exp: "11-05-2030", urg: "ALREADY EXPIRED", rem: "" },
  { org: "Maharana Pratap hospital and research centre Bhopal", fn: "Dr Arpit", ln: "Soni", mob: "8109601266", status: "Application in progress", cat: "Certified", exp: "11-08-2027", urg: "Expiring > 1 year", rem: "" },
  { org: "Maharishi Vedic Health Centre", fn: "Dr Shivam", ln: "Shrivastava", mob: "7224997700", status: "Hot", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "He said that they have already applied." },
  { org: "MAHAVEER INSTITUTE OF MEDICAL SCIENCES REASEARCH", fn: "Anwar", ln: "Khan", mob: "7000881267", status: "Cold", cat: "Certified", exp: "15-07-2028", urg: "", rem: "ELC is currently valid. Will plan to apply after expiry" },
  { org: "MAHESHWARI HOSPITAL", fn: "Deepak", ln: "Verma", mob: "8959535257", status: "Existing", cat: "Accredited", exp: "20-09-2030", urg: "Expiring <= 90 days", rem: "" },
  { org: "Malti Hospital & Test Tube Baby Centre", fn: "Dr. Gaurav", ln: "Aggarwal", mob: "9826751175", status: "Cold", cat: "Certified", exp: "25-11-2026", urg: "Expiring 91-180 days", rem: "Said no we don't wanna apply and immediately disconnected the call" },
  { org: "MANAN CHILD CARE & MULTISPECIALTY HOSPITAL", fn: "BHAVANA", ln: "MEENA", mob: "7000344582", status: "Engaged", cat: "Certified", exp: "16-12-2026", urg: "Expiring 91-180 days", rem: "Did not respond" },
  { org: "Manisha Hospital", fn: "Dr Rahul", ln: "Khare", mob: "9827224463", status: "Existing", cat: "Certified", exp: "19-08-2026", urg: "Expiring <= 90 days", rem: "" },
  { org: "Manomay maternity and nursing home", fn: "Roshni", ln: "Kiran", mob: "7879327900", status: "Engaged", cat: "Certified", exp: "29-04-2026", urg: "ALREADY EXPIRED", rem: "Rejected the call" },
  { org: "Manoria Heart & Critical Care Hospital", fn: "PREETI", ln: "BISEN", mob: "7974832107", status: "Warm", cat: "Certified", exp: "03-11-2027", urg: "Expiring > 1 year", rem: "She said they will plan to apply after 6-7 months. There ELC valid is till Nov 2027. Hence will plan accordingly" },
  { org: "MANSAROVAR AYURVEDIC MEDICAL COLLEGE HOSPITAL AND RESEARCH CENTRE", fn: "DR PRAKASH SINGH", ln: "RAJPUT", mob: "8269440330", status: "Engaged", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "Did not respond" },
  { org: "Mansarovar Dental College", fn: "Dr Syed Mohammed", ln: "Noorani", mob: "7987282405", status: "Cold", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "He said that he is from Dental college, for Dental hospital they have no plans for NABH currently, Upon asking for the number of somebody from the hospital said that he doesn't have the number and hence can't give the number of the concern person from the hospital." },
  { org: "MANYA HOSPITAL", fn: "NITIN", ln: "SHRIVASTAVA", mob: "9406956839", status: "Cold", cat: "Certified", exp: "02-06-2027", urg: "Expiring 181-365 days", rem: "They have their ELC validity till June 2027. Will then plan for accreditation" },
  { org: "Maqsood memorial hospital", fn: "Aman", ln: "Parvez", mob: "9171136287", status: "Hot", cat: "Certified", exp: "31-07-2025", urg: "ALREADY EXPIRED", rem: "Plans to apply after 1-2 months. Preparations are undergoing. No handholding required currently" },
  { org: "Maqsoot Hospital", fn: "Ayaz", ln: "Khan", mob: "7987467877", status: "Hot", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "Preparations are undergoing, plans to apply within 1-2 month, no handholding required currently." },
  { org: "Maruti Multispeciality Hospital , Bhopal, Madhya Pradesh, India", fn: "Dr Pooja", ln: "Sharma", mob: "7974554198", status: "Existing", cat: "Accredited", exp: "16-07-2030", urg: "ALREADY EXPIRED", rem: "" },
  { org: "Marvel Hospital", fn: "RAKHI", ln: "GOKHE", mob: "6267378233", status: "Engaged", cat: "Certified", exp: "03-02-2027", urg: "Expiring 91-180 days", rem: "Did not respond" },
  { org: "Matratva hospital", fn: "Amit", ln: "Agarwal", mob: "9425600094", status: "Engaged", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "Did not respond" },
  { org: "MAYUR HOSPITAL", fn: "Shariq", ln: "Khan", mob: "9755737850", status: "Engaged", cat: "Certified", exp: "04-03-2028", urg: "", rem: "Did not respond" },
  { org: "MDC hospital", fn: "Rishika", ln: "Bindal", mob: "8839641290", status: "Won", cat: "Certified", exp: "20-04-2028", urg: "Expiring > 1 year", rem: "" },
  { org: "Medayu Multi-speciality Hospital", fn: "Abhilasha", ln: "Agarwal", mob: "9826754447", status: "Existing", cat: "Certified", exp: "02-06-2028", urg: "", rem: "" },
  { org: "Medicare Hospital", fn: "Dr. Swapnil", ln: "Agrawal", mob: "9413686780", status: "Engaged", cat: "Certified", exp: "05-02-2026", urg: "ALREADY EXPIRED", rem: "Did not respond" },
  { org: "Medilife Hospital", fn: "Vaibhav", ln: "Saxena", mob: "9754782968", status: "Existing", cat: "Accredited", exp: "16-02-2030", urg: "", rem: "" },
  { org: "Mediliv liver and multispeciality hospital", fn: "Gaurav", ln: "Saxena", mob: "8234851630", status: "Cold", cat: "Certified", exp: "20-04-2024", urg: "ALREADY EXPIRED", rem: "Did not respond" },
  { org: "Meenakshi Hospital", fn: "Suman", ln: "Kumar", mob: "9425011272", status: "Cold", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "Not sure of the timeline. Said that the senior management is not in town hence they do not know about the time when they will apply. No specific reason given" },
  { org: "Meta children hospital", fn: "Shaishta", ln: "Mirza", mob: "7974262672", status: "Cold", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "Did not respond" },
  { org: "metrocity hospital", fn: "Devesh", ln: "Batham", mob: "7024550870", status: "Engaged", cat: "Certified", exp: "14-09-2024", urg: "ALREADY EXPIRED", rem: "Did not respond" },
  { org: "Metrocity multispeciality hospital", fn: "Vishal", ln: "Raghuvanshi", mob: "9098241501", status: "Engaged", cat: "Certified", exp: "14-09-2024", urg: "ALREADY EXPIRED", rem: "Did not respond" },
  { org: "Mona Multispeciality Hospital", fn: "Rishi", ln: "Mehta", mob: "9893373338", status: "Engaged", cat: "Certified", exp: "12-10-2027", urg: "Expiring > 1 year", rem: "Disconnected the call saying he is busy with patient" },
  { org: "MOUNT HOSPITAL", fn: "Dr Narendra", ln: "Pal", mob: "9981057127", status: "Existing", cat: "Certified", exp: "24-03-2027", urg: "ALREADY EXPIRED", rem: "" },
  { org: "Multicare Hospital", fn: "Kishore", ln: "Mewada", mob: "9893537845", status: "Engaged", cat: "Certified", exp: "04-03-2028", urg: "Expiring > 1 year", rem: "Did not respond" },
  { org: "NAMAN CHILDREN HOSPITAL", fn: "DR ARPIT", ln: "SAHU", mob: "9399424021", status: "Hot", cat: "Certified", exp: "03-11-2027", urg: "Expiring > 1 year", rem: "Preparations have started, plans to apply after 2-3 months. No handholding required currently." },
  { org: "national hospital", fn: "Vineetha", ln: "Joseph", mob: "7024807002", status: "Hot", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "planning to apply for NABH Entry Level Certification . she require handholding support so that they can complete the Certification process as quickly as possible.urgent...She also wants to attend the webinar" },
  { org: "NDC hospital and Trauma Center", fn: "Dileep", ln: "Bihare", mob: "9753262233", status: "Application in progress", cat: "Accreditation under process", exp: "", urg: "", rem: "" },
  { org: "NEOGASTROPLUS A UNIT OF GP HEALTHCARE", fn: "Dr. SHEETAL", ln: "RATHORE", mob: "7987013253", status: "Warm", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "The hospital has just started back in May 2026. Plans to apply for ELC in next 6-7 months" },
  { org: "NEURON TRAUMA CENTER & MULTISPECIALITY HOSPITAL", fn: "Pankaj", ln: "Kumar sharma", mob: "8839725404", status: "Warm", cat: "Certified", exp: "10-01-2022", urg: "ALREADY EXPIRED", rem: "They plan to apply but are facing financial issues and plans to apply by Jan. Upon asking for training they said that once they will start they will reach out to us" },
  { org: "NEW ADARSH HOSPITAL", fn: "Manish", ln: "Chauchan", mob: "9826822876", status: "Existing", cat: "Accredited", exp: "18-06-2030", urg: "Expiring 181-365 days", rem: "Already applied in March in 2026, Waiting for certificate" },
  { org: "Nilay Hospital", fn: "Dr Ankit", ln: "Chouhan", mob: "7415418159", status: "Application in progress", cat: "Certified", exp: "21-09-2024", urg: "ALREADY EXPIRED", rem: "" },
  { org: "Nishat Nursing Home", fn: "Javed", ln: "Aslam", mob: "7987080052", status: "Engaged", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "Did not respond" },
  { org: "om hospital and research center", fn: "ANKUR", ln: "mishra", mob: "9669198778", status: "Engaged", cat: "Certified", exp: "10-06-2026", urg: "ALREADY EXPIRED", rem: "Did not respond" },
  { org: "Om hospital and research centre bhopal", fn: "Kapil", ln: "Kurmi", mob: "9753924122", status: "Existing", cat: "Certified", exp: "10-06-2026", urg: "ALREADY EXPIRED", rem: "" },
  { org: "Om sai hospital Berasia", fn: "Deepak", ln: "Dhakad", mob: "9713580310", status: "Hot", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "They have started preparing their documents from this month. Will apply in next 1-2 month. No handholding required currently" },
  { org: "PALIWAL hospital KAROND", fn: "Chnadrapal", ln: "Singh", mob: "6265186191", status: "Hot", cat: "Certified", exp: "27-02-2028", urg: "", rem: "They got their ELC done recently on 9th May, hospital is under preparation will plan to apply within 6 month for full accreditation." },
  { org: "PARAS HOSPITAL", fn: "Rajendra", ln: "Gaur", mob: "8839216178", status: "Cold", cat: "Certified", exp: "25-07-2025", urg: "ALREADY EXPIRED", rem: "" },
  { org: "People's Hospital Bhanpur Bhopal", fn: "Dr Ashwani", ln: "Choudhary", mob: "9407255717", status: "Hot", cat: "Certified", exp: "25-08-2026", urg: "", rem: "Plans to apply within 6 months, needs guidance & handholding. Just finished the OA for ELC." },
  { org: "PGI Hospital and Research Center", fn: "Inaam Ulllah", ln: "Ansari", mob: "9406540122", status: "Hot", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "Did not respond" },
  { org: "Prabal multispeciality hospital", fn: "DR PRAKASH", ln: "DHADSE", mob: "9425608210", status: "Cold", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "Did not respond" },
  { org: "Prabhat Shri Hospital", fn: "Dr Ram Kumar", ln: "Deshmukh", mob: "9926333173", status: "Cold", cat: "Certified", exp: "02-03-2024", urg: "ALREADY EXPIRED", rem: "ELC is currently valid. Not sure of the timeline" },
  { org: "Prakash Eyecare and laser center", fn: "RUPESH", ln: "SURYAVANSHI", mob: "8962457807", status: "Existing", cat: "Certified", exp: "23-02-2028", urg: "", rem: "" },
  { org: "Prayas nasha mukti evam manochikitsa kendra", fn: "Abhishek", ln: "Singh", mob: "7772886600", status: "Hot", cat: "Certified", exp: "11-08-2027", urg: "Expiring > 1 year", rem: "Did not respond" },
  { org: "Promise children and general hospital", fn: "Dr deepak", ln: "Kumar ahirwar", mob: "9340601569", status: "Engaged", cat: "Certified", exp: "28-07-2027", urg: "Expiring 181-365 days", rem: "Rejected the call" },
  { org: "Promise hospital", fn: "Ali", ln: "Mew", mob: "9575709577", status: "Engaged", cat: "Certified", exp: "28-07-2027", urg: "Expiring 181-365 days", rem: "Did not respond" },
  { org: "Pushkom maternity and Nursing home", fn: "Yogesh Bhooshan", ln: "Jain", mob: "9826021285", status: "Engaged", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "Did not respond" },
  { org: "R R HOSPITAL", fn: "Rahul", ln: "Bidua", mob: "9893296529", status: "Hot", cat: "Certified", exp: "19-01-2028", urg: "Expiring > 1 year", rem: "Did not respond" },
  { org: "R. K . HOSPITAL & RESEARCH CENTRE", fn: "Nasir", ln: "Khan", mob: "9111612380", status: "Engaged", cat: "Certified", exp: "20-05-2027", urg: "Expiring 181-365 days", rem: "Did not respond" },
  { org: "R.K.D.F. Homoeopathic Medical Collge & Hospital, Research Centre, Bhopal", fn: "Dr. Nupur", ln: "Upadhyay", mob: "7089770606", status: "Engaged", cat: "Certified", exp: "07-07-2028", urg: "", rem: "Did not respond" },
  { org: "Radha raman institute of group", fn: "Shraddha", ln: "Yadav", mob: "6263653926", status: "Cold", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "They are focusing on admissions in their hospital and Chairman is also not available for next 3-4 months. Plans to apply after this year." },
  { org: "Radharaman Ayurved Medical College Research Hospital", fn: "Dr Rahul", ln: "Jain", mob: "9893221063", status: "Warm", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "Did not respond" },
  { org: "Radharaman Institute of Nursing", fn: "SHWETA", ln: "RAI", mob: "7489138566", status: "Cold", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "Did not respond" },
  { org: "Rai Hospital and Research Centre", fn: "Vibha", ln: "Rai", mob: "8889678630", status: "Application in progress", cat: "Accreditation under process", exp: "", urg: "", rem: "" },
  { org: "Rainbow Children Hospital , Bhopal", fn: "Vandana", ln: "Rajput", mob: "7746827666", status: "Cold", cat: "Certified", exp: "29-09-2026", urg: "Expiring <= 90 days", rem: "Did not respond" },
  { org: "Rainbow Children Hospital,Bhopal", fn: "Dr Ankita", ln: "Katiyar", mob: "7021249065", status: "Cold", cat: "Certified", exp: "29-09-2026", urg: "Expiring <= 90 days", rem: "" },
  { org: "RAJDHANI HOSPITAL", fn: "Umashankar", ln: "Kurmi", mob: "8827487286", status: "Application in progress", cat: "Certified", exp: "13-05-2026", urg: "ALREADY EXPIRED", rem: "" },
  { org: "Rajiv Gandhi general hospital", fn: "Naresh kumar", ln: "Bisen", mob: "9977232764", status: "Cold", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "ELC is currently valid. Will plan to apply after expiry." },
  { org: "Ramansh hospital and medical research center", fn: "Dr.Nishant", ln: "Shrivastava", mob: "9827320673", status: "Hot", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "Internal updates are undergoing, they plan to apply after 2-3 months. Handholding required" },
  { org: "Rani Dullaiya Smriti Ayurved Collage and Hospital", fn: "Dr Ajit Kumar", ln: "Shrivastava", mob: "9074676268", status: "Existing", cat: "Certified", exp: "26-05-2028", urg: "", rem: "" },
  { org: "Ranikamlapati multispeciality hospital", fn: "Akash", ln: "dhakad", mob: "7697264331", status: "Cold", cat: "Certified", exp: "04-08-2028", urg: "", rem: "" },
  { org: "Red Cross Hospital", fn: "Dr. D.P.", ln: "Agrawal", mob: "9425028401", status: "Hot", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "Plans to aply after 1-2 months. Handholding required" },
  { org: "Rishiraj College of Dental Sciences and Research Centre, Bhopal", fn: "Dr Samarth", ln: "Vajpayee", mob: "9039647662", status: "Warm", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "Plans to apply after 6 months as they plan to get Ayushman bharat incorporated soon." },
  { org: "Roshan Hospital", fn: "Rohan", ln: "Bhatnagar", mob: "7089203006", status: "Cold", cat: "Certified", exp: "04-11-2026", urg: "Expiring <= 90 days", rem: "" },
  { org: "S v eye care and LASIK laser centre", fn: "Monika", ln: "", mob: "9685317019", status: "Cold", cat: "Certified", exp: "23-12-2026", urg: "Expiring 91-180 days", rem: "" },
  { org: "S V Eye Care And Research Centre Bhopal", fn: "Paresh", ln: "Nichlani", mob: "8055027321", status: "Cold", cat: "Certified", exp: "14-04-2027", urg: "Expiring 181-365 days", rem: "Call 1: Akanksha (30/07/26): They are currently ELC. They lack modular OTR which is under construction hence plans to apply after 1 year" },
  { org: "Sai hospital and trauma centre", fn: "bahadur singh", ln: "yadav", mob: "9617855896", status: "Hot", cat: "Certified", exp: "16-06-2027", urg: "Expiring 181-365 days", rem: "Preparations are undergoing, plans to apply within 1-2 month, no handholding required currently." },
  { org: "Sai shraddha Hospital", fn: "Dr Rk patel", ln: "patel", mob: "9425007769", status: "Warm", cat: "Certified", exp: "14-09-2024", urg: "ALREADY EXPIRED", rem: "Plans to apply after 5-6 month, but has issue why he should pay Annual fees every year. What is the benefit to him after paying 2 lakh every year." },
  { org: "Sakshi hospital", fn: "Yogesh", ln: "Shrivastava", mob: "9893368702", status: "Cold", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "Disconected the call the moment he heard NABH, said we don't have any plans and disconnected" },
  { org: "Samarpan oncology and multispeciality hospital", fn: "Sohail", ln: "Khan", mob: "8305886453", status: "Engaged", cat: "Certified", exp: "23-06-2027", urg: "Expiring 181-365 days", rem: "Did not respond" },
  { org: "Samriddhi hospital", fn: "Kamlesh", ln: "Sahu azad", mob: "9893686162", status: "Application in progress", cat: "Certified", exp: "13-10-2027", urg: "Expiring > 1 year", rem: "" },
  { org: "SANT CITY HOSPITAL", fn: "Shyam", ln: "Mewada", mob: "8720835437", status: "Cold", cat: "Certified", exp: "09-12-2026", urg: "Expiring 91-180 days", rem: "They are a very small setup. Have no plans to apply for accreditation currently. ELC will get expired in 2028 then will plan for accreditation." },
  { org: "Sant Hirdaram hospital", fn: "Dinesh", ln: "Yadav", mob: "7828330758", status: "Existing", cat: "Certified", exp: "26-01-2029", urg: "", rem: "" },
  { org: "Sarthak Hospital", fn: "jitendra", ln: "singh", mob: "7017952650", status: "Cold", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "Currently they are into a rented building, their own hospital is under construction, once it is done they will apply for ELC first." },
  { org: "SHARDA HOSPITAL AND DIAGNOSTIC CENTRE", fn: "Dr Umesh sharda", ln: "Sharda", mob: "9826023140", status: "Cold", cat: "Certified", exp: "23-02-2025", urg: "ALREADY EXPIRED", rem: "He said that the hospital is very old and currently some internal issues are going on. He said that currently saving hospital is important for them so they have no plans to apply for NABH" },
  { org: "Shekhar Hospital", fn: "VANDANA", ln: "TIGGA", mob: "9479557314", status: "Cold", cat: "Certified", exp: "14-01-2027", urg: "Expiring 91-180 days", rem: "Did not respond" },
  { org: "Shree Balaji Multispeciality Hospital", fn: "Narendra", ln: "Parmar", mob: "9977997234", status: "Warm", cat: "Certified", exp: "11-08-2027", urg: "Expiring > 1 year", rem: "Call 1: Akanksha (30/07/26): Did not respond Call 2: Plans to apply after 6 month" },
  { org: "SHREE KRISHNA HOSPITAL", fn: "Dr satish kumar", ln: "Adwani", mob: "9827078758", status: "Cold", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "Disconnected the call saying he is busy with patient" },
  { org: "Shree paliwal hospital & Trauma Centre", fn: "Kavita", ln: "Paliwal", mob: "8435092602", status: "Cold", cat: "Certified", exp: "19-12-2028", urg: "", rem: "Applied for ELC recently, closure of NC is undergoing" },
  { org: "Shree shubh hospital", fn: "Deepak Baghel", ln: "Baghel", mob: "9977922777", status: "Engaged", cat: "Certified", exp: "20-05-2024", urg: "ALREADY EXPIRED", rem: "Did not respond" },
  { org: "Shree vinyak hospital", fn: "Muskan", ln: "Vishwakarma", mob: "8602258594", status: "Hot", cat: "Certified", exp: "23-09-2023", urg: "ALREADY EXPIRED", rem: "Preparations have started, plans to apply after 2-3 months. No handholding required currently." },
  { org: "shri sai hospital", fn: "Atul", ln: "Verma", mob: "9826342962", status: "Warm", cat: "Certified", exp: "26-10-2026", urg: "Expiring <= 90 days", rem: "They are getting their ELC renewed, once it is done then they will plan to apply for ful accreditation after 6-7 months" },
  { org: "Shubh Hospital", fn: "Shubhanshu", ln: "Richhariya", mob: "6266026535", status: "Hot", cat: "Certified", exp: "16-12-2026", urg: "Expiring 91-180 days", rem: "Preparations are undergoing, plans to apply within 1-2 month, no handholding required currently." },
  { org: "Smart city Hospital", fn: "Vinod", ln: "Rajput", mob: "9770470968", status: "Hot", cat: "Certified", exp: "10-01-2026", urg: "ALREADY EXPIRED", rem: "Plans to apply after 2-3 months. Preparations are undergoing. No handholding required currently" },
  { org: "Spandan hospital Bhopal", fn: "Abha kiran ruhela", ln: "Abha", mob: "9131557257", status: "Hot", cat: "Certified", exp: "08-11-2025", urg: "ALREADY EXPIRED", rem: "Plans to apply within 1-2 months, needs guidance & handholding" },
  { org: "Sps hospital", fn: "Aarti", ln: "Yadav", mob: "8957414566", status: "Cold", cat: "Certified", exp: "08-12-2027", urg: "Expiring > 1 year", rem: "Number is switched off" },
  { org: "SR TULSI MULTI SPECIALITY HOSPITAL", fn: "Shaitan singh", ln: "Rajput", mob: "8103442171", status: "Engaged", cat: "Certified", exp: "15-09-2027", urg: "Expiring > 1 year", rem: "Did not respond" },
  { org: "SR TULSI MULTISPECIALITY HOSPITAL PRIVATE LIMITED", fn: "DR VIVEK KUMAR", ln: "SHUKLA", mob: "9229670367", status: "Hot", cat: "Certified", exp: "15-09-2027", urg: "Expiring > 1 year", rem: "He said that they are planning to apply after 3 months, requires a overall handholding" },
  { org: "SRI SAI AROGYA SANSTHA SRI SAI INSTITUTE OF AYURVEDIC RESEARCH AND MEDICINE", fn: "DR MANISH", ln: "LADHAVE", mob: "9755437171", status: "Engaged", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "Did not respond" },
  { org: "SRI SAI INSTITUTE OF AYURVEDIC RESEARCH AND MEDICINE BHOPAL", fn: "DR VIKAS", ln: "JAIN", mob: "9630282333", status: "Engaged", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "Did not respond" },
  { org: "SS HOSPITAL", fn: "Dr Gambheer", ln: "Singh", mob: "9644856560", status: "Cold", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "No plans currently, said that it is a vey small setup." },
  { org: "Suditi Hospital", fn: "Dharmendra", ln: "Saxena", mob: "9039215133", status: "Warm", cat: "Certified", exp: "23-09-2026", urg: "Expiring <= 90 days", rem: "Did not respond" },
  { org: "Suncity maternity & multi-speciality hospital", fn: "Dr Azhar", ln: "Qudeer", mob: "9977233360", status: "Engaged", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "Did not respond" },
  { org: "SUNRISE CHILDREN HOSPITAL", fn: "Satendra", ln: "Pathak", mob: "8821872457", status: "Cold", cat: "Certified", exp: "10-12-2028", urg: "", rem: "Plans to apply for ELC, as they are a small setup within 6 months. ELCP-26-001756, OA pending" },
  { org: "SUNSHINE HOSPITAL BHOAPL", fn: "Dr D.P.", ln: "Mewada", mob: "9826558282", status: "Existing", cat: "Certified", exp: "19-05-2027", urg: "Expiring > 1 year", rem: "" },
  { org: "Swastik hospital", fn: "Rashmi", ln: "Jain", mob: "9713424007", status: "Hot", cat: "Certified", exp: "12-05-2027", urg: "Expiring 181-365 days", rem: "Preparations have started, plans to apply after 2-3 months. No handholding required currently." },
  { org: "SWASTIK HOSPITAL", fn: "DR Rajneesh", ln: "Singhai", mob: "9200145202", status: "Engaged", cat: "Certified", exp: "12-05-2027", urg: "Expiring 181-365 days", rem: "Did not respond" },
  { org: "Tanushree Hospital", fn: "Hariom", ln: "Shrama", mob: "9425674096", status: "Engaged", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "Did not respond" },
  { org: "Tender Care Women's and Children's Hospital", fn: "Dipankar", ln: "Sarkar", mob: "9977701964", status: "Hot", cat: "Certified", exp: "09-06-2027", urg: "Expiring 181-365 days", rem: "Plans to apply within 1-2 months, needs guidance & handholding" },
  { org: "Tender care womens and childrens hospital pvt ltd", fn: "Gautam", ln: "Bhalerao", mob: "7709611456", status: "Hot", cat: "Certified", exp: "09-06-2027", urg: "Expiring 181-365 days", rem: "He said that they are currently preparing the documents, using the SAT to prepare the documents and will apply in next 3-4 months" },
  { org: "THE CAPITAL HOSPITAL", fn: "Shubham", ln: "Jain", mob: "9179337680", status: "Warm", cat: "Certified", exp: "12-05-2027", urg: "Expiring 181-365 days", rem: "Disconnected the call" },
  { org: "THE COUNTY HOSPITAL & RESEARCH CENTRE", fn: "Sunil", ln: "Meena", mob: "8435372504", status: "Won", cat: "Certified", exp: "05-05-2027", urg: "Expiring 181-365 days", rem: "" },
  { org: "THE MERCYS SAMM HOSPITAL", fn: "Azam", ln: "Hafeez khan", mob: "7000418524", status: "Engaged", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "Switched off" },
  { org: "Trimurti Hospital", fn: "Niraj", ln: "Kumar", mob: "9905581211", status: "Engaged", cat: "Certified", exp: "01-12-2027", urg: "Expiring > 1 year", rem: "Did not respond" },
  { org: "Trinity multispecilty hospital", fn: "Harshika", ln: "Khatwani", mob: "8305510701", status: "Existing", cat: "Accredited", exp: "30-01-2030", urg: "ALREADY EXPIRED", rem: "" },
  { org: "Tripti multi-speciality and trauma centre", fn: "Amit", ln: "Singh", mob: "7880120993", status: "Engaged", cat: "Certified", exp: "04-03-2028", urg: "Expiring > 1 year", rem: "Did not respond" },
  { org: "Unique Hospital, Bhopal", fn: "Ishrat Zuber Zuber", ln: "Zuber", mob: "9993944323", status: "Cold", cat: "Certified", exp: "11-04-2026", urg: "ALREADY EXPIRED", rem: "" },
  { org: "V Care Children Hospital", fn: "Jitheesh", ln: "P", mob: "6263995901", status: "Application in progress", cat: "Accreditation under process", exp: "", urg: "", rem: "" },
  { org: "VAIDEHI HOSPITAL", fn: "Dr. Vikrant", ln: "Sen", mob: "9993813153", status: "Engaged", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "Did not respond" },
  { org: "VAISHNAVI MULTISPECIALITY HOSPITAL", fn: "DR ALKESH", ln: "WAGADRE", mob: "9827641202", status: "Cold", cat: "Certified", exp: "16-02-2028", urg: "Expiring > 1 year", rem: "Did not respond" },
  { org: "Vardhman Medicare Hospital", fn: "Anand", ln: "Gupta", mob: "9302440604", status: "Cold", cat: "Certified", exp: "23-09-2023", urg: "ALREADY EXPIRED", rem: "ELC is currently valid. Will plan to apply after expiry" },
  { org: "Veena Vadini Ayurved College & Hospital", fn: "Dr. Ashutosh", ln: "Mishra", mob: "9926351220", status: "Engaged", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "Did not respond" },
  { org: "VIDHANTA MULTI SPECIALITY HOSPITAL", fn: "Manoj kumar", ln: "Pandey", mob: "7697207969", status: "Engaged", cat: "Not Yet Certified/Accredited", exp: "15-12-2023", urg: "", rem: "Number is switched off" },
  { org: "VIJAY SHREE HOSPITAL BHOPAL", fn: "Dr SUNIL", ln: "SHUKLA", mob: "9993823003", status: "Existing", cat: "Certified", exp: "14-10-2026", urg: "Expiring <= 90 days", rem: "Do not want to go for accreditation as this point" },
  { org: "Vijaya Maternity & Nursing Home", fn: "GAURAV", ln: "Narware", mob: "9575446686", status: "Cold", cat: "Not Yet Certified/Accredited", exp: "Not found", urg: "", rem: "Gave me the number of Deepali (8605275037). No plans to apply currently, no specific reason given." },
  { org: "Vision hospital", fn: "narendra", ln: "rajput", mob: "8486881840", status: "Cold", cat: "Certified", exp: "14-04-2028", urg: "Expiring > 1 year", rem: "" },
  { org: "VISION HOSPITAL AND MULTISPECIALITY TRAUMA UNIT BHOPAL", fn: "IRSHAD", ln: "KHAN", mob: "9754642574", status: "Hot", cat: "Certified", exp: "14-04-2028", urg: "Expiring > 1 year", rem: "Plans to apply after 2-3 months. Preparations are undergoing. No handholding required currently" },
  { org: "Yash Hospital", fn: "Dr.DiLIP SINGH", ln: "Rajput", mob: "9165226141", status: "Cold", cat: "Certified", exp: "01-06-2028", urg: "Expiring > 1 year", rem: "" },
  { org: "Yashvi hospital Bhopal", fn: "dr.subhash malviya", ln: "Malviya", mob: "9243195778", status: "Cold", cat: "Certified", exp: "10-06-2026", urg: "ALREADY EXPIRED", rem: "" },
  { org: "Yashvi multi speciality hospital", fn: "Naresh", ln: "Manik", mob: "8602765123", status: "Cold", cat: "Certified", exp: "02-02-2024", urg: "ALREADY EXPIRED", rem: "Did not respond" },
  { org: "ZINDAL HOSPITAL", fn: "Abhishek", ln: "Kumar", mob: "8109242637", status: "Existing", cat: "Accredited", exp: "02-07-2030", urg: "Expiring 181-365 days", rem: "Inspection done on 28th March 2026, waiting for the certificate" }
];

export const INITIAL_STATES: StateLocation[] = [
  {
    id: 'state-mp',
    name: 'Madhya Pradesh',
    cities: ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Rewa']
  },
  {
    id: 'state-up',
    name: 'Uttar Pradesh',
    cities: ['Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Prayagraj']
  },
  {
    id: 'state-mh',
    name: 'Maharashtra',
    cities: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad']
  },
  {
    id: 'state-gj',
    name: 'Gujarat',
    cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot']
  },
  {
    id: 'state-cg',
    name: 'Chhattisgarh',
    cities: ['Raipur', 'Bilaspur', 'Durg', 'Bhilai']
  }
];

export const INITIAL_HOSPITALS: Hospital[] = RAW_DATA.map((row, idx) => {
  const normStatus = (
    row.status.toLowerCase().includes('progress') ? 'Application in progress' :
    row.status.toLowerCase().includes('hot') ? 'Hot' :
    row.status.toLowerCase().includes('warm') ? 'Warm' :
    row.status.toLowerCase().includes('won') ? 'Won' :
    row.status.toLowerCase().includes('cold') ? 'Cold' :
    row.status.toLowerCase().includes('exist') ? 'Existing' :
    row.status.toLowerCase().includes('lost') ? 'Lost' : 'Engaged'
  );

  const orgLower = row.org.toLowerCase();
  const city = orgLower.includes('indore') ? 'Indore' :
               orgLower.includes('jabalpur') ? 'Jabalpur' :
               orgLower.includes('gwalior') ? 'Gwalior' :
               orgLower.includes('bairagarh') ? 'Bhopal' : 'Bhopal';
  const state = 'Madhya Pradesh';

  // Seed sample yatra event attendance for lifecycle tracking
  const hasAttendedYatra = idx % 2 === 0 || normStatus === 'Won' || normStatus === 'Application in progress';
  const yatraDate = hasAttendedYatra ? `2026-0${(idx % 4) + 4}-15` : undefined;
  const yatraName = hasAttendedYatra ? `Aarogya Yatra ${city} Healthcare Summit 2026` : undefined;

  const convertedDate = normStatus === 'Won' ? '2026-07-28' : undefined;

  return {
    id: `hosp-sheet-${idx + 1}`,
    organisation: row.org,
    firstName: row.fn || '',
    lastName: row.ln || '',
    mobile: row.mob || '',
    state: state,
    city: city,
    callStatus: normStatus,
    accreditationCategory: row.cat || 'Not Yet Certified/Accredited',
    expiryDate: row.exp || 'Not found',
    renewalUrgency: row.urg || '',
    yatraEventAttended: hasAttendedYatra,
    yatraEventDate: yatraDate,
    yatraEventName: yatraName,
    yatraCity: city,
    enrolledCohortIds: [], // No training added till now for anyone as requested
    convertedDate: convertedDate,
    remarks: row.rem ? [
      {
        id: `rem-init-${idx + 1}`,
        date: '2026-08-19T00:00:00Z',
        author: 'Advisor Call Log',
        callStatus: normStatus,
        remark: row.rem,
        channel: 'Phone Call'
      }
    ] : [],
    remarksText: row.rem || '',
    createdAt: '2026-08-19',
    updatedAt: '2026-08-19'
  };
});

export const INITIAL_COHORTS: TrainingCohort[] = [];

export const INITIAL_YATRAS: YatraEvent[] = [
  {
    id: 'yatra-bhopal-2026',
    title: 'Aarogya Yatra Bhopal Healthcare Summit',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    date: '2026-06-15',
    venue: 'Bhopal Quality Hall & Medical Chamber',
    hospitalIds: [
      'hosp-sheet-1',
      'hosp-sheet-3',
      'hosp-sheet-4',
      'hosp-sheet-7',
      'hosp-sheet-11',
      'hosp-sheet-13',
      'hosp-sheet-19',
      'hosp-sheet-20',
      'hosp-sheet-26',
      'hosp-sheet-30'
    ]
  },
  {
    id: 'yatra-indore-2026',
    title: 'Aarogya Yatra Indore Quality Convention',
    city: 'Indore',
    state: 'Madhya Pradesh',
    date: '2026-05-20',
    venue: 'Indore Medical Association Auditorium',
    hospitalIds: [
      'hosp-sheet-2',
      'hosp-sheet-5',
      'hosp-sheet-8',
      'hosp-sheet-14',
      'hosp-sheet-21'
    ]
  },
  {
    id: 'yatra-jabalpur-2026',
    title: 'Aarogya Yatra Jabalpur Regional Summit',
    city: 'Jabalpur',
    state: 'Madhya Pradesh',
    date: '2026-07-10',
    venue: 'Jabalpur Civic & Healthcare Center',
    hospitalIds: [
      'hosp-sheet-6',
      'hosp-sheet-10',
      'hosp-sheet-15'
    ]
  },
  {
    id: 'yatra-gwalior-2026',
    title: 'Aarogya Yatra Gwalior Conclave',
    city: 'Gwalior',
    state: 'Madhya Pradesh',
    date: '2026-04-18',
    venue: 'Gwalior Chamber of Commerce & Healthcare',
    hospitalIds: [
      'hosp-sheet-9',
      'hosp-sheet-12',
      'hosp-sheet-18'
    ]
  }
];

