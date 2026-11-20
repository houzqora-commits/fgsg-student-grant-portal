/* ============================================================
   FGSG — core app logic
   Data lists, page routing (landing / auth / app), auth tabs,
   dock navigation, multi-step application form and uploads.
   Loaded first; liveness.js and payment.js build on this.
   ============================================================ */

var STATES=["Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara","FCT — Abuja"];
var SCHOOLS=["Abia State University (ABSU), Uturu","Abubakar Tafawa Balewa University (ATBU), Bauchi","Adamawa State University (ADSU), Mubi","Adekunle Ajasin University (AAUA), Akungba-Akoko","Afe Babalola University (ABUAD), Ado-Ekiti","Ahmadu Bello University (ABU), Zaria","Akwa Ibom State University (AKSU)","Alex Ekwueme Federal University, Ndufu-Alike (AE-FUNAI)","Al-Hikmah University, Ilorin","Ambrose Alli University (AAU), Ekpoma","American University of Nigeria (AUN), Yola","Babcock University, Ilishan-Remo","Bayero University Kano (BUK)","Baze University, Abuja","Benue State University (BSU), Makurdi","Borno State University (BOSU), Maiduguri","Bowen University, Iwo","Caleb University, Lagos","Chukwuemeka Odumegwu Ojukwu University (COOU), Uli","Covenant University, Ota","Delta State University (DELSU), Abraka","Delta State University of Science and Technology, Ozoro","Dennis Osadebay University, Asaba","Ebonyi State University (EBSU), Abakaliki","Edo State University, Uzairue","Ekiti State University (EKSU), Ado-Ekiti","Enugu State University of Science and Technology (ESUT)","Federal University, Birnin Kebbi (FUBK)","Federal University, Dutse (FUD)","Federal University, Dutsin-Ma (FUDMA)","Federal University, Gashua (FUGA)","Federal University, Gusau (FUGUS)","Federal University, Kashere (FUKASHERE)","Federal University, Lafia (FULAFIA)","Federal University, Lokoja (FULOKOJA)","Federal University, Otuoke (FUOTUOKE)","Federal University, Oye-Ekiti (FUOYE)","Federal University, Wukari (FUWUKARI)","Federal University of Agriculture, Abeokuta (FUNAAB)","Federal University of Health Sciences, Ila-Orangun (FUHSI)","Federal University of Health Sciences, Otukpo (FUHSO)","Federal University of Petroleum Resources, Effurun (FUPRE)","Federal University of Technology, Akure (FUTA)","Federal University of Technology, Babura (FUTB)","Federal University of Technology, Ikot Abasi (FUTIA)","Federal University of Technology, Minna (FUTMINNA)","Federal University of Technology, Owerri (FUTO)","Federal University of Transportation, Daura","Fountain University, Osogbo","Gombe State University (GSU)","Ignatius Ajuru University of Education (IAUE), Port Harcourt","Imo State University (IMSU), Owerri","Joseph Sarwuan Tarka University, Makurdi (JOSTUM)","Kaduna State University (KASU)","Kano University of Science and Technology (KUST) / Aliko Dangote University, Wudil","Kebbi State University of Science and Technology, Aliero","Kogi State University (KSU) / Prince Abubakar Audu University, Anyigba","Kwara State University (KWASU), Malete","Ladoke Akintola University of Technology (LAUTECH), Ogbomoso","Lagos State University (LASU)","Landmark University, Omu-Aran","Lead City University, Ibadan","Michael Okpara University of Agriculture, Umudike (MOUAU)","Modibbo Adama University (MAU), Yola","Nasarawa State University (NSUK), Keffi","National Open University of Nigeria (NOUN)","Niger Delta University (NDU), Yenagoa","Nigeria Defence Academy (NDA), Kaduna","Nigeria Police Academy, Wudil","Nile University of Nigeria, Abuja","Nnamdi Azikiwe University (UNIZIK), Awka","Obafemi Awolowo University (OAU), Ile-Ife","Olabisi Onabanjo University (OOU), Ago-Iwoye","Olusegun Agagu University of Science and Technology (OAUSTECH), Okitipupa","Osun State University (UNIOSUN), Osogbo","Plateau State University (PLASU), Bokkos","Redeemer's University, Ede","Rivers State University (RSU), Port Harcourt","Skyline University Nigeria, Kano","Sokoto State University (SSU)","Tai Solarin University of Education (TASUED), Ijebu-Ode","Taraba State University (TSU), Jalingo","Umaru Musa Yar'adua University (UMYU), Katsina","University of Abuja (UNIABUJA)","University of Benin (UNIBEN)","University of Calabar (UNICAL)","University of Cross River State (UNICROSS), Calabar","University of Delta, Agbor (UNIDEL)","University of Ibadan (UI)","University of Ilorin (UNILORIN)","University of Jos (UNIJOS)","University of Lagos (UNILAG)","University of Maiduguri (UNIMAID)","University of Medical Sciences (UNIMED), Ondo","University of Nigeria, Nsukka (UNN)","University of Port Harcourt (UNIPORT)","University of Uyo (UNIUYO)","Yobe State University (YSU), Damaturu","Zamfara State University, Talata Mafara","Abia State Polytechnic, Aba","Adamawa State Polytechnic, Yola","Akwa Ibom State Polytechnic, Ikot Osurua","Auchi Polytechnic, Auchi","Federal Polytechnic, Ado Ekiti","Federal Polytechnic, Bali","Federal Polytechnic, Bauchi","Federal Polytechnic, Bida","Federal Polytechnic, Damaturu","Federal Polytechnic, Ede","Federal Polytechnic, Ekowe","Federal Polytechnic, Idah","Federal Polytechnic, Ilaro","Federal Polytechnic, Ile-Oluji","Federal Polytechnic, Kaura Namoda","Federal Polytechnic, Mubi","Federal Polytechnic, Nasarawa","Federal Polytechnic, Nekede, Owerri","Federal Polytechnic, Offa","Federal Polytechnic, Oko","Federal Polytechnic, Ukana, Akwa Ibom","Federal Polytechnic of Oil and Gas, Bonny","Gateway Polytechnic, Saapade","Hassan Usman Katsina Polytechnic","Isa Mustapha Agwai I Polytechnic, Lafia","Kaduna Polytechnic (KADPOLY)","Kano State Polytechnic","Ken Saro-Wiwa Polytechnic, Bori","Kwara State Polytechnic, Ilorin","Lagos State Polytechnic (LASPOTECH) / LASUSTECH, Ikorodu","Moshood Abiola Polytechnic (MAPOLY), Abeokuta","Nuhu Bamalli Polytechnic, Zaria","Osun State Polytechnic, Iree","Osun State College of Technology, Esa-Oke","Ramat Polytechnic, Maiduguri","Rufus Giwa Polytechnic, Owo","The Polytechnic, Ibadan","Yaba College of Technology (YABATECH)","Akwa Ibom State College of Education, Afaha Nsit","College of Education, Ikere-Ekiti","College of Education, Warri","Federal College of Education, Abeokuta","Federal College of Education, Akoka (Technical), Lagos","Federal College of Education, Eha-Amufu","Federal College of Education, Kano","Federal College of Education, Katsina","Federal College of Education, Kontagora","Federal College of Education, Obudu","Federal College of Education, Okene","Federal College of Education, Ondo","Federal College of Education, Pankshin","Federal College of Education, Yola","Federal College of Education, Zaria","Federal College of Education (Technical), Asaba","Federal College of Education (Technical), Bichi","Federal College of Education (Technical), Gombe","Federal College of Education (Technical), Potiskum","Federal College of Education (Technical), Umunneochi","Kogi State College of Education, Ankpa","Kwara State College of Education, Ilorin","Nwafor Orizu College of Education, Nsugbe"];
/* ---------- picker data: LGAs by state, departments, banks ---------- */
var LGAS={
"Abia":["Aba North","Aba South","Arochukwu","Bende","Ikwuano","Isiala Ngwa North","Isiala Ngwa South","Isuikwuato","Obi Ngwa","Ohafia","Osisioma","Ugwunagbo","Ukwa East","Ukwa West","Umuahia North","Umuahia South","Umu Nneochi"],
"Adamawa":["Demsa","Fufore","Ganye","Girei","Gombi","Guyuk","Hong","Jada","Lamurde","Madagali","Maiha","Mayo-Belwa","Michika","Mubi North","Mubi South","Numan","Shelleng","Song","Toungo","Yola North","Yola South"],
"Akwa Ibom":["Abak","Eastern Obolo","Eket","Esit Eket","Essien Udim","Etim Ekpo","Etinan","Ibeno","Ibesikpo Asutan","Ibiono Ibom","Ika","Ikono","Ikot Abasi","Ikot Ekpene","Ini","Itu","Mbo","Mkpat Enin","Nsit Atai","Nsit Ibom","Nsit Ubium","Obot Akara","Okobo","Onna","Oron","Oruk Anam","Udung Uko","Ukanafun","Uruan","Urue-Offong/Oruko","Uyo"],
"Anambra":["Aguata","Anambra East","Anambra West","Anaocha","Awka North","Awka South","Ayamelum","Dunukofia","Ekwusigo","Idemili North","Idemili South","Ihiala","Njikoka","Nnewi North","Nnewi South","Ogbaru","Onitsha North","Onitsha South","Orumba North","Orumba South","Oyi"],
"Bauchi":["Alkaleri","Bauchi","Bogoro","Damban","Darazo","Dass","Ganjuwa","Giade","Itas/Gadau","Jama'are","Katagum","Kirfi","Misau","Ningi","Shira","Tafawa Balewa","Toro","Warji","Zaki"],
"Bayelsa":["Brass","Ekeremor","Kolokuma/Opokuma","Nembe","Ogbia","Sagbama","Southern Ijaw","Yenagoa"],
"Benue":["Ado","Agatu","Apa","Buruku","Gboko","Guma","Gwer East","Gwer West","Katsina-Ala","Konshisha","Kwande","Logo","Makurdi","Obi","Ogbadibo","Ohimini","Oju","Okpokwu","Otukpo","Tarka","Ukum","Ushongo","Vandeikya"],
"Borno":["Abadam","Askira/Uba","Bama","Bayo","Biu","Chibok","Damboa","Dikwa","Gubio","Guzamala","Gwoza","Hawul","Jere","Kaga","Kala/Balge","Konduga","Kukawa","Kwaya Kusar","Mafa","Magumeri","Maiduguri","Marte","Mobbar","Monguno","Ngala","Nganzai","Shani"],
"Cross River":["Abi","Akamkpa","Akpabuyo","Bakassi","Bekwarra","Biase","Boki","Calabar Municipal","Calabar South","Etung","Ikom","Obanliku","Obubra","Obudu","Odukpani","Ogoja","Yakurr","Yala"],
"Delta":["Aniocha North","Aniocha South","Bomadi","Burutu","Ethiope East","Ethiope West","Ika North East","Ika South","Isoko North","Isoko South","Ndokwa East","Ndokwa West","Oshimili North","Oshimili South","Patani","Sapele","Udu","Ughelli North","Ughelli South","Ukwuani","Uvwie","Warri North","Warri South","Warri South West"],
"Ebonyi":["Abakaliki","Afikpo North","Afikpo South","Ebonyi","Ezza North","Ezza South","Ikwo","Ishielu","Ivo","Izzi","Ohaozara","Ohaukwu","Onicha"],
"Edo":["Akoko-Edo","Egor","Esan Central","Esan North-East","Esan South-East","Esan West","Etsako Central","Etsako East","Etsako West","Igueben","Ikpoba-Okha","Oredo","Orhionmwon","Ovia North-East","Ovia South-West","Owan East","Owan West","Uhunmwonde"],
"Ekiti":["Ado Ekiti","Efon","Ekiti East","Ekiti South-West","Ekiti West","Emure","Gbonyin","Ido Osi","Ijero","Ikere","Ikole","Ilejemeje","Irepodun/Ifelodun","Ise/Orun","Moba","Oye"],
"Enugu":["Aninri","Awgu","Enugu East","Enugu North","Enugu South","Ezeagu","Igbo Etiti","Igbo Eze North","Igbo Eze South","Isi Uzo","Nkanu East","Nkanu West","Nsukka","Oji River","Udenu","Udi","Uzo-Uwani"],
"Gombe":["Akko","Balanga","Billiri","Dukku","Funakaye","Gombe","Kaltungo","Kwami","Nafada","Shongom","Yamaltu/Deba"],
"Imo":["Aboh Mbaise","Ahiazu Mbaise","Ehime Mbano","Ezinihitte","Ideato North","Ideato South","Ihitte/Uboma","Ikeduru","Isiala Mbano","Isu","Mbaitoli","Ngor Okpala","Njaba","Nkwerre","Nwangele","Obowo","Oguta","Ohaji/Egbema","Okigwe","Onuimo","Orlu","Orsu","Oru East","Oru West","Owerri Municipal","Owerri North","Owerri West"],
"Jigawa":["Auyo","Babura","Biriniwa","Birnin Kudu","Buji","Dutse","Gagarawa","Garki","Gumel","Guri","Gwaram","Gwiwa","Hadejia","Jahun","Kafin Hausa","Kaugama","Kazaure","Kiri Kasama","Kiyawa","Maigatari","Malam Madori","Miga","Ringim","Roni","Sule Tankarkar","Taura","Yankwashi"],
"Kaduna":["Birnin Gwari","Chikun","Giwa","Igabi","Ikara","Jaba","Jema'a","Kachia","Kaduna North","Kaduna South","Kagarko","Kajuru","Kaura","Kauru","Kubau","Kudan","Lere","Makarfi","Sabon Gari","Sanga","Soba","Zangon Kataf","Zaria"],
"Kano":["Ajingi","Albasu","Bagwai","Bebeji","Bichi","Bunkure","Dala","Dambatta","Dawakin Kudu","Dawakin Tofa","Doguwa","Fagge","Gabasawa","Garko","Garun Mallam","Gaya","Gezawa","Gwale","Gwarzo","Kabo","Kano Municipal","Karaye","Kibiya","Kiru","Kumbotso","Kura","Madobi","Makoda","Minjibir","Nasarawa","Rano","Rimin Gado","Rogo","Shanono","Sumaila","Takai","Tarauni","Tofa","Tsanyawa","Tudun Wada","Ungogo","Warawa","Wudil"],
"Katsina":["Bakori","Batagarawa","Batsari","Baure","Bindawa","Charanchi","Dan Musa","Dandume","Danja","Daura","Dutsi","Dutsin-Ma","Faskari","Funtua","Ingawa","Jibia","Kafur","Kaita","Kankara","Kankia","Katsina","Kurfi","Kusada","Mai'Adua","Malumfashi","Mani","Mashi","Matazu","Musawa","Rimi","Sabuwa","Safana","Sandamu","Zango"],
"Kebbi":["Aleiro","Arewa Dandi","Argungu","Augie","Bagudo","Birnin Kebbi","Bunza","Dandi","Fakai","Gwandu","Jega","Kalgo","Koko/Besse","Maiyama","Ngaski","Sakaba","Shanga","Suru","Wasagu/Danko","Yauri","Zuru"],
"Kogi":["Adavi","Ajaokuta","Ankpa","Bassa","Dekina","Ibaji","Idah","Igalamela-Odolu","Ijumu","Kabba/Bunu","Kogi","Lokoja","Mopa-Muro","Ofu","Ogori/Magongo","Okehi","Okene","Olamaboro","Omala","Yagba East","Yagba West"],
"Kwara":["Asa","Baruten","Edu","Ekiti","Ifelodun","Ilorin East","Ilorin South","Ilorin West","Irepodun","Isin","Kaiama","Moro","Offa","Oke Ero","Oyun","Pategi"],
"Lagos":["Agege","Ajeromi-Ifelodun","Alimosho","Amuwo-Odofin","Apapa","Badagry","Epe","Eti Osa","Ibeju-Lekki","Ifako-Ijaiye","Ikeja","Ikorodu","Kosofe","Lagos Island","Lagos Mainland","Mushin","Ojo","Oshodi-Isolo","Shomolu","Surulere"],
"Nasarawa":["Akwanga","Awe","Doma","Karu","Keana","Keffi","Kokona","Lafia","Nasarawa","Nasarawa Egon","Obi","Toto","Wamba"],
"Niger":["Agaie","Agwara","Bida","Borgu","Bosso","Chanchaga","Edati","Gbako","Gurara","Katcha","Kontagora","Lapai","Lavun","Magama","Mariga","Mashegu","Mokwa","Moya","Paikoro","Rafi","Rijau","Shiroro","Suleja","Tafa","Wushishi"],
"Ogun":["Abeokuta North","Abeokuta South","Ado-Odo/Ota","Ewekoro","Ifo","Ijebu East","Ijebu North","Ijebu North East","Ijebu Ode","Ikenne","Imeko-Afon","Ipokia","Obafemi-Owode","Odeda","Odogbolu","Ogun Waterside","Remo North","Sagamu","Yewa North","Yewa South"],
"Ondo":["Akoko North-East","Akoko North-West","Akoko South-East","Akoko South-West","Akure North","Akure South","Ese Odo","Idanre","Ifedore","Ilaje","Ile Oluji/Okeigbo","Irele","Odigbo","Okitipupa","Ondo East","Ondo West","Ose","Owo"],
"Osun":["Aiyedaade","Aiyedire","Atakumosa East","Atakumosa West","Boluwaduro","Boripe","Ede North","Ede South","Egbedore","Ejigbo","Ife Central","Ife East","Ife North","Ife South","Ifedayo","Ifelodun","Ila","Ilesa East","Ilesa West","Irepodun","Irewole","Isokan","Iwo","Obokun","Odo Otin","Ola Oluwa","Olorunda","Oriade","Orolu","Osogbo"],
"Oyo":["Afijio","Akinyele","Atiba","Atisbo","Egbeda","Ibadan North","Ibadan North-East","Ibadan North-West","Ibadan South-East","Ibadan South-West","Ibarapa Central","Ibarapa East","Ibarapa North","Ido","Irepo","Iseyin","Itesiwaju","Iwajowa","Kajola","Lagelu","Ogbomosho North","Ogbomosho South","Ogo Oluwa","Olorunsogo","Oluyole","Ona Ara","Orelope","Ori Ire","Oyo East","Oyo West","Saki East","Saki West","Surulere"],
"Plateau":["Barkin Ladi","Bassa","Bokkos","Jos East","Jos North","Jos South","Kanam","Kanke","Langtang North","Langtang South","Mangu","Mikang","Pankshin","Qua'an Pan","Riyom","Shendam","Wase"],
"Rivers":["Abua/Odual","Ahoada East","Ahoada West","Akuku-Toru","Andoni","Asari-Toru","Bonny","Degema","Eleme","Emohua","Etche","Gokana","Ikwerre","Khana","Obio/Akpor","Ogba/Egbema/Ndoni","Ogu/Bolo","Okrika","Omuma","Opobo/Nkoro","Oyigbo","Port Harcourt","Tai"],
"Sokoto":["Binji","Bodinga","Dange Shuni","Gada","Goronyo","Gudu","Gwadabawa","Illela","Isa","Kebbe","Kware","Rabah","Sabon Birni","Shagari","Silame","Sokoto North","Sokoto South","Tambuwal","Tangaza","Tureta","Wamako","Wurno","Yabo"],
"Taraba":["Ardo Kola","Bali","Donga","Gashaka","Gassol","Ibi","Jalingo","Karim Lamido","Kurmi","Lau","Sardauna","Takum","Ussa","Wukari","Yorro","Zing"],
"Yobe":["Bade","Bursari","Damaturu","Fika","Fune","Geidam","Gujba","Gulani","Jakusko","Karasuwa","Machina","Nangere","Nguru","Potiskum","Tarmuwa","Yunusari","Yusufari"],
"Zamfara":["Anka","Bakura","Birnin Magaji/Kiyaw","Bukkuyum","Bungudu","Gummi","Gusau","Kaura Namoda","Maradun","Maru","Shinkafi","Talata Mafara","Tsafe","Zurmi"],
"FCT — Abuja":["Abaji","Abuja Municipal (AMAC)","Bwari","Gwagwalada","Kuje","Kwali"]
};
var DEPARTMENTS=["Accountancy","Agriculture","Anatomy","Animal Science","Architecture","Banking and Finance","Biochemistry","Biology","Botany","Business Administration","Chemical Engineering","Chemistry","Civil Engineering","Computer Engineering","Computer Science","Crop Science","Dentistry","Economics","Education","Electrical/Electronics Engineering","English and Literary Studies","Estate Management","Fisheries","Food Science and Technology","Forestry","Geography","Geology","Guidance and Counselling","History and International Studies","Hospitality and Tourism","Human Resource Management","Industrial Chemistry","Information Technology","International Relations","Law","Library and Information Science","Linguistics","Marketing","Mass Communication","Mathematics","Mechanical Engineering","Medical Laboratory Science","Medicine and Surgery","Microbiology","Nursing Science","Nutrition and Dietetics","Pharmacy","Philosophy","Physics","Physiology","Physiotherapy","Political Science","Psychology","Public Administration","Public Health","Quantity Surveying","Radiography","Religious Studies","Sociology","Software Engineering","Soil Science","Statistics","Surveying and Geoinformatics","Theatre Arts","Urban and Regional Planning","Veterinary Medicine","Zoology"];
var BANKS=["Access Bank","Citibank Nigeria","Ecobank Nigeria","Fidelity Bank","First Bank of Nigeria","First City Monument Bank (FCMB)","Globus Bank","Guaranty Trust Bank (GTBank)","Heritage Bank","Jaiz Bank","Keystone Bank","Kuda Microfinance Bank","Moniepoint Microfinance Bank","OPay","PalmPay","Parallex Bank","Polaris Bank","Premium Trust Bank","Providus Bank","Stanbic IBTC Bank","Standard Chartered Bank","Sterling Bank","SunTrust Bank","TAJBank","Titan Trust Bank","Union Bank","United Bank for Africa (UBA)","Unity Bank","Wema Bank","Zenith Bank"];
/* Withdrawal banks — commercial banks ONLY. Mobile money /
   microfinance wallets (OPay, PalmPay, Kuda, Moniepoint MFB and
   similar) are deliberately NOT in this list, so they can never
   be picked for a Grant Wallet withdrawal. */
var COMMERCIAL_BANKS=["Access Bank","Citibank Nigeria","Ecobank Nigeria","Fidelity Bank","First Bank of Nigeria","First City Monument Bank (FCMB)","Globus Bank","Guaranty Trust Bank (GTBank)","Heritage Bank","Jaiz Bank","Keystone Bank","Parallex Bank","Polaris Bank","Premium Trust Bank","Providus Bank","Stanbic IBTC Bank","Standard Chartered Bank","Sterling Bank","SunTrust Bank","TAJBank","Titan Trust Bank","Union Bank","United Bank for Africa (UBA)","Unity Bank","Wema Bank","Zenith Bank"];

/* ---------- one app-style searchable picker for every dropdown ----------
   Each field is a button + hidden input (the hidden input keeps the
   field id, so val() and validation work exactly as before). Tapping
   the button opens the shared sheet: black head, green outline,
   search bar on top that filters the list as you type, tap to pick. */
var PICKER_DEFS={
  state:{title:'State of Origin',input:'fState',text:'pickText-state',placeholder:'Select state…',search:'Search states…',options:function(){return STATES;}},
  lga:{title:'Local Government Area',input:'fLga',text:'pickText-lga',placeholder:'Select LGA…',search:'Search LGAs…',custom:true,options:function(){return LGAS[val('fState')]||[];},note:function(){return val('fState')?'':'Select state of origin first';}},
  type:{title:'Institution Type',input:'fType',text:'pickText-type',placeholder:'Select…',search:'Search types…',options:function(){return ['University','Polytechnic','College of Education'];}},
  level:{title:'Level',input:'fLevel',text:'pickText-level',placeholder:'Select…',search:'Search levels…',options:function(){return ['ND 1','ND 2','HND 1','HND 2','100 Level','200 Level','300 Level','400 Level','500 Level','600 Level'];}},
  school:{title:'Institution Name',input:'fSchool',text:'pickText-school',placeholder:'Select institution…',search:'Search institutions…',options:function(){return SCHOOLS;}},
  dept:{title:'Department',input:'fDept',text:'pickText-dept',placeholder:'Select department…',search:'Search departments…',custom:true,options:function(){return DEPARTMENTS;}},
  wbank:{title:'Commercial Bank',input:'fWithdrawBank',text:'pickText-wbank',placeholder:'Select commercial bank…',search:'Search commercial banks…',options:function(){return COMMERCIAL_BANKS;}}
};
var pickerKey=null;
function pickerSetValue(key,value){
  var def=PICKER_DEFS[key]; if(!def) return;
  var prev=document.getElementById(def.input).value;
  document.getElementById(def.input).value=value;
  var t=document.getElementById(def.text); t.textContent=value; t.classList.remove('ph');
  if(key==='wbank' && prev!==value && typeof resetWithdrawVerification==='function'){
    resetWithdrawVerification();
    var wa=document.getElementById('wAcct');
    if(wa && /^\d{10}$/.test((wa.value||'').replace(/\D/g,'')) && typeof verifyWithdrawAccount==='function'){
      setTimeout(function(){ verifyWithdrawAccount(true); },120);
    }
  }
  if(key==='state'){
    var lgaDef=PICKER_DEFS.lga, lv=document.getElementById(lgaDef.input).value;
    if(lv && (LGAS[value]||[]).indexOf(lv)<0){
      document.getElementById(lgaDef.input).value='';
      var lt=document.getElementById(lgaDef.text); lt.textContent=lgaDef.placeholder; lt.classList.add('ph');
    }
  }
  if(typeof saveDraft==='function') saveDraft();
}
function renderPickerList(){
  var def=PICKER_DEFS[pickerKey]; if(!def) return;
  var raw=document.getElementById('pickerSearch').value.trim();
  var q=raw.toLowerCase();
  var list=document.getElementById('pickerList'); list.innerHTML='';
  var current=document.getElementById(def.input).value;
  var opts=def.options();
  var note=def.note?def.note():'';
  if(note && !opts.length){
    var n=document.createElement('div'); n.className='sheet-empty'; n.textContent=note; list.appendChild(n);
  }
  var matches=opts.filter(function(o){
    if(!q) return true;
    var hay=o.toLowerCase();
    return q.split(/\s+/).every(function(tok){return hay.indexOf(tok)>=0;});
  });
  document.getElementById('pickerCount').textContent=matches.length+(matches.length===1?' option':' options');
  if(opts.length && !matches.length){
    var e=document.createElement('div'); e.className='sheet-empty'; e.textContent='No match found'; list.appendChild(e);
  }
  matches.forEach(function(o){
    var b=document.createElement('button'); b.type='button';
    b.className='sheet-opt'+(o===current?' sel':''); b.setAttribute('role','option');
    var s=document.createElement('span'); s.textContent=o; b.appendChild(s);
    if(o===current){ var tk=document.createElement('span'); tk.className='tick'; tk.textContent='✓'; b.appendChild(tk); }
    b.addEventListener('click',function(){ pickerSetValue(pickerKey,o); closePicker(); });
    list.appendChild(b);
  });
  var foot=document.getElementById('pickerFoot'), cb=document.getElementById('pickerCustomBtn');
  var exact=opts.some(function(o){return o.toLowerCase()===q;});
  if(def.custom && raw && !exact){ foot.style.display='block'; cb.textContent='Use “'+raw+'”'; }
  else { foot.style.display='none'; }
}
function openPicker(key){
  if(!PICKER_DEFS[key]) return;
  pickerKey=key;
  var def=PICKER_DEFS[key];
  document.getElementById('pickerTitle').textContent=def.title;
  var s=document.getElementById('pickerSearch'); s.value=''; s.placeholder=def.search;
  /* Do NOT focus the search box here: tapping a dropdown must not
     open the keyboard. The keyboard opens only when the user taps
     the search box itself (its native focus behaviour). The sheet
     also starts in its normal bottom position, keyboard-free. */
  if(document.activeElement===s){ try{s.blur();}catch(e){} }
  var ov=document.getElementById('pickerOverlay');
  ov.classList.remove('kb-open');
  renderPickerList();
  ov.classList.add('open');
  var list=document.getElementById('pickerList'); if(list) list.scrollTop=0;
}
function closePicker(){
  var ov=document.getElementById('pickerOverlay');
  ov.classList.remove('open'); ov.classList.remove('kb-open');
  var s=document.getElementById('pickerSearch');
  if(s && document.activeElement===s){ try{s.blur();}catch(e){} }
  pickerKey=null;
}
/* When the search box itself is tapped, it gains focus and the
   keyboard opens — only then does the sheet move to the top of
   the screen (kb-open), so the keyboard sits below it instead of
   covering it. On blur the sheet stays put briefly so a tap on an
   option underneath is not lost to a layout jump; closePicker
   clears the class when the sheet closes. */
var pickerSearchEl=document.getElementById('pickerSearch');
if(pickerSearchEl){
  pickerSearchEl.addEventListener('focus',function(){
    document.getElementById('pickerOverlay').classList.add('kb-open');
  });
  pickerSearchEl.addEventListener('blur',function(){
    /* Delay the move back down: a tap on an option blurs the search
       box first, and dropping the sheet instantly would shift the
       option out from under the tap. 220ms lets that tap land (it
       closes the sheet anyway); if the picker is still open after
       it, the keyboard was dismissed, so settle back down. */
    setTimeout(function(){
      if(document.activeElement!==pickerSearchEl){
        document.getElementById('pickerOverlay').classList.remove('kb-open');
      }
    },220);
  });
}
document.querySelectorAll('[data-picker]').forEach(function(btn){
  btn.addEventListener('click',function(){ openPicker(btn.dataset.picker); });
});
document.getElementById('pickerSearch').addEventListener('input',renderPickerList);
document.getElementById('pickerClose').addEventListener('click',closePicker);
document.getElementById('pickerOverlay').addEventListener('click',function(e){ if(e.target===this) closePicker(); });
document.getElementById('pickerCustomBtn').addEventListener('click',function(){
  var raw=document.getElementById('pickerSearch').value.trim();
  if(pickerKey && raw){ pickerSetValue(pickerKey,raw); closePicker(); }
});
document.addEventListener('keydown',function(e){
  if(e.key==='Escape' && pickerKey) closePicker();
});

/* heavy libraries load on demand only, so every page opens fast */
var _scriptCache={};
function loadScriptOnce(src){
  if(_scriptCache[src]) return _scriptCache[src];
  _scriptCache[src]=new Promise(function(res,rej){
    var sc=document.createElement('script'); sc.src=src; sc.async=true;
    sc.onload=function(){res();}; sc.onerror=function(){rej(new Error('load failed'));};
    document.head.appendChild(sc);
  });
  return _scriptCache[src];
}

function toast(msg){var t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(function(){t.classList.remove('show')},2600);}

/* ---------- Grant Wallet ID: randomised last numbers, per account ----------
   The trailing 4 digits are generated once per signed-in account
   (cryptographically random, 0001–9999) and saved in this browser
   under that account's email, so the same user always sees their
   own Wallet ID and different users do not all share 0001. */
function walletIdKey(){
  var u=(window.FGSGAuth && FGSGAuth.currentUser())?FGSGAuth.currentUser():null;
  var fe=document.getElementById('fEmail');
  var e=u?u.email:((fe&&fe.value)||'').trim().toLowerCase();
  return 'fgsg_wallet_id_v1_'+(e||'guest');
}
function getOrCreateWalletId(){
  var key=walletIdKey();
  try{
    var existing=localStorage.getItem(key);
    if(existing && /^FGSG-W-2026-\d{4}$/.test(existing) && existing!=='FGSG-W-2026-0001') return existing;
  }catch(e){}
  var n;
  if(window.crypto && crypto.getRandomValues){
    var arr=new Uint32Array(1); crypto.getRandomValues(arr); n=1+(arr[0]%9999);
  } else {
    n=1+Math.floor(Math.random()*9999);
  }
  if(n===1) n=2;
  var id='FGSG-W-2026-'+('0000'+n).slice(-4);
  try{ localStorage.setItem(key,id); }catch(e){}
  return id;
}
function renderWalletId(){
  var el=document.getElementById('walletIdPill');
  if(el) el.textContent='Wallet ID · '+getOrCreateWalletId();
  renderSerial();
}
/* ---------- Serial No.: LIVE from Supabase, starting at 0101 ----------
   The serial is never a hardcoded or random number here: it is
   fetched fresh from Supabase by fgsgRefreshSerial() in
   supabase-client.js (live applications count, in order, first
   student 0101, next 0102, then 0103…). This function only
   throttles the refresh and paints the last live value; the
   starting placeholder 0101 in the markup is the first serial
   itself, shown until the first live count lands. */
var _serialRefreshAt=0;
function renderSerial(){
  if(window.__fgsgSerial && typeof fgsgRenderSerial==='function'){
    fgsgRenderSerial(window.__fgsgSerial, window.__fgsgLiveCount);
  }
  var now=Date.now();
  if(typeof fgsgRefreshSerial==='function' && now-_serialRefreshAt>4000){
    _serialRefreshAt=now;
    fgsgRefreshSerial();
  }
}

/* ---------- page routing: landing / auth / app are separate pages ----------
   Page changes slide sideways in the direction of travel: a
   later page comes in from the right, going back comes in from
   the left. The navbar is universal: ONE dock element at body
   level, outside every page, inherited by all of them — a page
   switch never rebuilds or re-animates it, so it cannot blink
   or lag. It belongs to the portal, so goPage shows it only
   while the portal page is open (body.in-portal); there is no
   bottom navbar on the landing or auth pages. */
var currentPageName='landing';
var PAGE_ORDER={landing:0,auth:1,app:2,admin:3};
var VIEW_ORDER={home:0,bank:1,application:2,notices:3,me:4};
function slideIn(el,dir){
  if(!el) return;
  el.classList.remove('anim-fwd','anim-back');
  void el.offsetWidth;
  el.classList.add(dir==='back'?'anim-back':'anim-fwd');
}
document.addEventListener('animationend',function(e){
  if(e.target && e.target.classList) e.target.classList.remove('anim-fwd','anim-back');
});
function goPage(page,authTab){
  /* proper auth check: the dashboard only opens with a live
     Supabase session — otherwise route to the Auth page. If the
     session is still being restored from Supabase on a fresh
     load, wait for it instead of bouncing a signed-in student
     to the login form. */
  if(page==='app' && window.FGSGAuth && !FGSGAuth.currentUser()){
    if(typeof FGSGAuth.whenReady==='function' && !goPage._authWaited){
      goPage._authWaited=true;
      FGSGAuth.whenReady().then(function(u){
        goPage._authWaited=false;
        if(u){ goPage('app'); } else { toast('Log in or create an account first'); goPage('auth', authTab||'login'); }
      });
      return;
    }
    toast('Log in or create an account first');
    page='auth'; if(!authTab) authTab='login';
  }
  if(page!=='app' && typeof liveRunning!=='undefined' && liveRunning && typeof liveReset==='function'){ liveReset(); }
  var prevPage=currentPageName;
  document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active')});
  var el=document.getElementById('page-'+page); if(el) el.classList.add('active');
  /* the universal dock lives outside the pages; only its
     visibility follows the current page — the element itself
     and its position are never touched */
  document.body.classList.toggle('in-portal',page==='app');
  if(el && prevPage!==page) slideIn(el,(PAGE_ORDER[page]<PAGE_ORDER[prevPage])?'back':'fwd');
  currentPageName=page;
  if(page==='auth' && authTab) switchAuthTab(authTab);
  window.scrollTo({top:0});
}
function goLandingAnchor(e,id){
  e.preventDefault(); goPage('landing');
  setTimeout(function(){ var t=document.getElementById(id); if(t) t.scrollIntoView({behavior:'smooth'}); },60);
}
function enterApp(view){ if(typeof restoreDraft==='function') restoreDraft(); renderWalletId(); if(typeof fgsgRefreshSerial==='function') fgsgRefreshSerial(); goPage('app'); showView(view||'home'); }
function switchAuthTab(name){
  document.querySelectorAll('[data-auth-tab]').forEach(function(t){t.classList.toggle('on',t.dataset.authTab===name)});
  document.querySelectorAll('[data-auth-panel]').forEach(function(p){p.classList.toggle('on',p.dataset.authPanel===name)});
}
/* authLogin / authSignup / authForgot / authLogout live in
   auth.js, backed by Supabase Auth (FGSGAuth). */
/* ---------- the green bubble follows the active view ----------
   The green bubble always sits on the active page: showView
   below only sets the dock's data-active-view attribute (a
   discrete state, never a measurement) and CSS moves the
   bubble to that column and swaps its icon — see the GREEN
   BUBBLE section at the end of styles.css. On the Application
   view the raised centre button itself is the bubble, so the
   bubble fades into it. An earlier design measured the dock
   with getBoundingClientRect on every switch — layout work on
   the exact frames the user is watching — and jittered; this
   one does zero measurement, so the bar cannot jitter, lag
   or re-place itself mid-transition. */

/* view switching — the incoming view slides in from the side
   it sits on in the dock */
var currentViewName='home';
function showView(name){
  if(name!=='application' && typeof liveRunning!=='undefined' && liveRunning && typeof liveReset==='function'){ liveReset(); }
  var prevView=currentViewName;
  document.querySelectorAll('.view').forEach(function(v){v.classList.remove('active')});
  var el=document.getElementById('view-'+name); if(el) el.classList.add('active');
  if(el && prevView!==name) slideIn(el,(VIEW_ORDER[name]<VIEW_ORDER[prevView])?'back':'fwd');
  currentViewName=name;
  document.querySelectorAll('.dock button').forEach(function(b){b.classList.toggle('active',b.dataset.view===name)});
  var dockEl=document.querySelector('.dock');
  if(dockEl) dockEl.setAttribute('data-active-view',name);
  if(typeof renderGrantState==='function') renderGrantState();
  if(name==='me') renderProfile();
}
document.querySelectorAll('.dock button').forEach(function(b){b.addEventListener('click',function(){showView(b.dataset.view);});});

/* multi-step form — Step 1 is the start screen (no login
   re-confirmation: the user is already signed in), so the
   counted form steps are Personal (2) through the
   verification fee (7), with Academic (4) and Background (5)
   before Documents & identity / liveness (6). There is no
   payout choice step: the grant goes to the Grant Wallet by
   default, and Step 8 is the submitted / Pending screen. */
var step=1, totalSteps=6, liveDone=false, feeDone=false, lastRenderedStep=null;
var titles={1:'Start your application',2:'Personal details',3:'Institution & course',4:'Academic details',5:'Background details',6:'Documents & identity',7:'Verification fee — Paystack',8:'Pending — Waiting for Approval'};
function renderStep(){
  document.querySelectorAll('.fstep').forEach(function(f){f.classList.toggle('active',+f.dataset.step===step)});
  /* steps slide in the direction of travel: Continue from the
     right, Back from the left */
  var activeStepEl=document.querySelector('.fstep.active');
  if(activeStepEl && lastRenderedStep!==null && lastRenderedStep!==step){
    slideIn(activeStepEl, step<lastRenderedStep?'back':'fwd');
  }
  lastRenderedStep=step;
  if(step===1){
    document.getElementById('stepTitle').textContent='Application — Start';
    document.getElementById('stepPct').textContent='0%';
    document.getElementById('pbar').style.width='0%';
  } else if(step===8){
    var approved7=(typeof isGrantApproved==='function')?isGrantApproved():false;
    document.getElementById('stepTitle').textContent=approved7?'Approved — Grant Credited':'Pending — Waiting for Approval';
    document.getElementById('stepPct').textContent='100%';
    document.getElementById('pbar').style.width='100%';
  } else {
    var shown=step-1;
    document.getElementById('stepTitle').textContent='Step '+shown+' of '+totalSteps+' — '+titles[step];
    var pct=Math.round(shown/totalSteps*100);
    document.getElementById('stepPct').textContent=pct+'%';
    document.getElementById('pbar').style.width=pct+'%';
  }
  document.getElementById('backBtn').style.visibility= step===1||step===8 ? 'hidden':'visible';
  document.getElementById('nextBtn').textContent= step===7 ? 'Submit Application ✓' : 'Continue →';
  document.getElementById('formNav').style.display= step===1||step===8 ? 'none':'flex';
  /* Cancel & Restart: available on ANY step while the application
     is still being filled in (Steps 2–6, and Step 1 if a draft is
     already in progress). It locks ONLY after Submit — Step 7 /
     a submitted application can never be cancelled or restarted. */
  var lockedRb=(typeof isSubmitted==='function'&&isSubmitted())||step===8;
  var hasProgressRb=step>1;
  if(!hasProgressRb){
    try{ hasProgressRb=typeof draftHasProgress==='function' && draftHasProgress(collectDraft()); }catch(e){}
  }
  var showRestart=!lockedRb && hasProgressRb;
  var rb=document.getElementById('restartAppBtn');
  if(rb){ rb.style.display= showRestart ? 'inline-flex':'none'; }
  if(step===7){ var pe=document.getElementById('psEmail'); if(pe) pe.textContent=(val('fEmail')||'you@example.com'); }
}
function val(id){return document.getElementById(id).value.trim();}
/* Step 1 legacy check, kept for compatibility: with Supabase
   Auth the signed-in user whose email matches continues
   without re-typing; signing up happens on the Auth page. */
function validateStep1Async(){
  var email=val('fEmail'), pw=document.getElementById('fPass').value;
  if(!window.FGSGAuth){
    if(!email||email.indexOf('@')<0){toast('Enter an email address to continue');return Promise.resolve(false);}
    if(!pw){toast('Create a password to continue');return Promise.resolve(false);}
    return Promise.resolve(true);
  }
  if(!FGSGAuth.validEmail(email)){ toast('Enter a valid email address to continue'); return Promise.resolve(false); }
  var user=FGSGAuth.currentUser();
  if(user && user.email===email.toLowerCase()){
    if(!pw) return Promise.resolve(true);
    return FGSGAuth.verifyPassword(email,pw).then(function(ok){
      if(!ok) toast('That password does not match your account');
      return ok;
    });
  }
  var existing=FGSGAuth.findUser(email);
  if(existing){
    if(!pw){ toast('This email already has an account — log in instead'); return Promise.resolve(false); }
    return FGSGAuth.verifyPassword(email,pw).then(function(ok){
      if(!ok){ toast('That password does not match your account'); return false; }
      FGSGAuth.startSession(email); if(typeof updateAuthUI==='function') updateAuthUI();
      return true;
    });
  }
  var perr=FGSGAuth.passwordError(pw);
  if(perr){ toast(perr); return Promise.resolve(false); }
  var nm=val('fName')||email.split('@')[0];
  return FGSGAuth.signup(nm,email,pw).then(function(){
    if(typeof updateAuthUI==='function') updateAuthUI();
    return true;
  }).catch(function(err){ toast(err.message); return false; });
}
function validateStep(){
  if(step===2){ if(!val('fName')||!val('fDob')||!val('fState')||!val('fLga')){toast('Complete name, date of birth, state of origin and LGA');return false;} var dob=val('fDob'); if(dob<'1980-01-01'||dob>'2016-12-31'){toast('Date of birth must be between 1980 and 2016');return false;} }
  if(step===3){ if(!val('fType')||!val('fLevel')||!val('fSchool')||!val('fDept')){toast('Complete institution type, level, institution and department');return false;} }
  if(step===4){
    if(!val('fMatric')){toast('Enter your matric / student registration number');return false;}
    var cgpa=parseFloat(val('fCgpa'));
    if(isNaN(cgpa)){toast('Enter your CGPA');return false;}
    if(cgpa>5){toast('CGPA cannot be more than 5.00');return false;}
    if(cgpa<3.5){toast('CGPA must be at least 3.50 to apply');return false;}
    if(!document.getElementById('upResult').files.length && !draftResultName){toast('Attach your current semester result / statement of result');return false;}
    if(!document.getElementById('upStudentId').files.length && !draftStudentIdName){toast('Attach your student ID card');return false;}
  }
  if(step===5){
    if(!document.getElementById('upOrigin').files.length && !draftOriginName){toast('Attach your certificate of origin');return false;}
    if(!document.getElementById('upBirth').files.length && !draftBirthName){toast('Attach your birth certificate / age declaration');return false;}
    if(!document.getElementById('upPassport').files.length && !draftPassportName){toast('Attach your passport photograph');return false;}
    if(!val('fParentsStatus')){toast("Enter your parents' financial status / occupation");return false;}
    var phoneDigits=val('fPhone').replace(/\D/g,'');
    if(phoneDigits.length===13 && phoneDigits.indexOf('234')===0) phoneDigits='0'+phoneDigits.slice(3);
    if(!/^\d{11}$/.test(phoneDigits)){toast('Enter a valid 11-digit phone number');return false;}
    var noSch=document.getElementById('fNoOtherScholarship');
    if(!noSch || !noSch.checked){toast('Confirm you are not a beneficiary of any other government scholarship');return false;}
  }
  if(step===6){ if(!document.getElementById('upJamb').files.length && !draftJambName){toast('Attach your JAMB admission letter');return false;} if(!document.getElementById('upFees').files.length && !draftFeesName){toast('Attach your last school fees receipt');return false;} var nin=val('fNin').replace(/\s/g,''); if(!/^\d{11}$/.test(nin)){toast('Enter 11 digits for NIN');return false;} if(!document.getElementById('upNin').files.length && !draftNinName){toast('Attach your NIN card or slip');return false;} if(!liveDone){toast('Run the liveness check to continue');return false;} }
  if(step===7){ if(!feeDone){toast('Pay the ₦3,000 verification fee with Paystack to continue');return false;} }
  return true;
}
var startAppBtn=document.getElementById('startAppBtn');
if(startAppBtn){ startAppBtn.addEventListener('click',function(){
  if(isSubmitted()){ step=8; renderStep(); renderGrantState(); toast('Application already submitted'); return; }
  step=2; renderStep(); saveDraft();
  window.scrollTo({top:document.getElementById('apply').offsetTop,behavior:'smooth'});
});}
document.getElementById('nextBtn').addEventListener('click',function(){
  if(step===8||isSubmitted()&&step>=8){ toast('Application already submitted'); return; }
  if(step<7){ if(!validateStep())return; step++; renderStep(); saveDraft(); window.scrollTo({top:document.getElementById('apply').offsetTop,behavior:'smooth'}); }
  else if(step===7){ if(!validateStep())return; submitApplication(); }
});
document.getElementById('backBtn').addEventListener('click',function(){ if(step===8) return; if(step>1){step--;renderStep();saveDraft();} });

/* uploads — the draft keeps the attached file names, because a page
   cannot refill a file input after a reload */
var UPLOAD_DRAFT_VARS={upJamb:'draftJambName',upFees:'draftFeesName',upNin:'draftNinName',upResult:'draftResultName',upStudentId:'draftStudentIdName',upOrigin:'draftOriginName',upBirth:'draftBirthName',upPassport:'draftPassportName'};
[['upJamb','okJamb'],['upFees','okFees'],['upNin','okNin'],['upResult','okResult'],['upStudentId','okStudentId'],['upOrigin','okOrigin'],['upBirth','okBirth'],['upPassport','okPassport']].forEach(function(pair){
  document.getElementById(pair[0]).addEventListener('change',function(e){ if(e.target.files.length){ var nm=e.target.files[0].name; var varName=UPLOAD_DRAFT_VARS[pair[0]]; if(varName==='draftJambName') draftJambName=nm; else if(varName==='draftFeesName') draftFeesName=nm; else if(varName==='draftResultName') draftResultName=nm; else if(varName==='draftStudentIdName') draftStudentIdName=nm; else if(varName==='draftOriginName') draftOriginName=nm; else if(varName==='draftBirthName') draftBirthName=nm; else if(varName==='draftPassportName') draftPassportName=nm; else if(varName==='draftNinName') draftNinName=nm; var ok=document.getElementById(pair[1]); ok.style.display='block'; ok.textContent='✓ '+nm+' attached'; saveDraft(); }});
});

/* ---------- application draft: progress saves at every step ----------
   The draft lives in this browser (localStorage), keyed by the
   signed-in Supabase email. Closing the page mid-application and
   coming back restores the step and every answer, so an applicant
   who stopped at Step 3 reopens the form on Step 3 with their
   details filled in. Restart clears the draft for this account
   and returns the form to Step 1. The submitted application
   itself is saved to Supabase (payment.js / supabase-client.js). */
var draftJambName='', draftFeesName='', draftNinName='', draftResultName='', draftStudentIdName='', draftOriginName='', draftBirthName='', draftPassportName='', draftAppRef='', draftRestoredFor=null, draftSubmittedAt=0;
/* Background approval: after submission the application stays
   Pending with no timer shown anywhere. The submission time is
   kept silently in the draft; once the background wait has
   elapsed the grant is credited with no countdown ever displayed. */
var GRANT_WAIT_MS=24*60*60*1000, GRANT_AMOUNT_TEXT='₦50,000.00';
function isSubmitted(){ return !!draftAppRef && !!draftSubmittedAt; }
function isGrantApproved(){ return isSubmitted() && (Date.now()-draftSubmittedAt>=GRANT_WAIT_MS); }
/* ---------- Withdraw Grant: Grant Wallet → commercial bank ----------
   Only available after the background 24-hour wait, when the
   ₦50,000 is credited. The user picks a commercial bank (no
   mobile money banks — see COMMERCIAL_BANKS), types a 10-digit
   account number, the account is checked with a Paystack-style
   validation loading state, and the resolved account name is
   shown for confirmation before the withdrawal is sent. */
var withdrawVerified=false, withdrawVerifying=false, withdrawDone=false, withdrawAcctName='', withdrawTimer=null, withdrawProcessingTimer=null, withdrawQueuedAmt=0;
/* Partial withdrawals: the wallet keeps whatever is left.
   withdrawTotal is everything withdrawn so far and
   withdrawHistory is every withdrawal, in order — the balance
   is always ₦50,000 minus withdrawTotal, and another withdrawal
   can be made whenever a balance remains. */
var withdrawTotal=0, withdrawHistory=[], withdrawJustQueued=false;
var draftFeePaidAt=0, draftFeeRef='';
/* Paystack bank codes for the commercial banks above. Account
   validation is done by the server endpoint /api/resolve-account,
   which holds the Paystack secret key — no secret ever appears
   in this frontend code, and the account name shown is only ever
   the name that endpoint returns. */
var BANK_CODES={"Access Bank":"044","Citibank Nigeria":"023","Ecobank Nigeria":"050","Fidelity Bank":"070","First Bank of Nigeria":"011","First City Monument Bank (FCMB)":"214","Globus Bank":"00103","Guaranty Trust Bank (GTBank)":"058","Heritage Bank":"030","Jaiz Bank":"301","Keystone Bank":"082","Parallex Bank":"104","Polaris Bank":"076","Premium Trust Bank":"105","Providus Bank":"101","Stanbic IBTC Bank":"221","Standard Chartered Bank":"068","Sterling Bank":"232","SunTrust Bank":"100","TAJBank":"302","Titan Trust Bank":"102","Union Bank":"032","United Bank for Africa (UBA)":"033","Unity Bank":"215","Wema Bank":"035","Zenith Bank":"057"};
function bankCodeFor(bank){ return BANK_CODES[bank]||''; }
function remainingBalance(){ return isGrantApproved() ? Math.max(0,50000-(withdrawTotal||0)) : 0; }
function formatMoneyFull(n){ return '₦'+(Number(n)||0).toLocaleString('en-NG')+'.00'; }
function formatTxDate(ts){
  if(!ts) return '—';
  try{ return new Date(ts).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})+' · '+new Date(ts).toLocaleTimeString('en-GB',{hour:'numeric',minute:'2-digit'}); }
  catch(e){ return '—'; }
}
function escTx(s){ return (typeof escapeHtml==='function')?escapeHtml(s):String(s||''); }
function setWithdrawStatus(msg,kind){
  var st=document.getElementById('withdrawStatus'); if(!st) return;
  st.textContent=msg||''; st.className='withdraw-status'+(kind?' '+kind:'');
}
function formatNairaAmt(n){ return '₦'+(Number(n)||0).toLocaleString('en-NG'); }
function withdrawAmountValue(){
  var el=document.getElementById('wAmount');
  return parseInt(((el&&el.value)||'').replace(/\D/g,''),10)||0;
}
function setWithdrawAmountStatus(msg,kind){
  var st=document.getElementById('withdrawAmountStatus'); if(!st) return;
  st.textContent=msg||''; st.className='withdraw-status'+(kind?' '+kind:'');
}
var withdrawReqSeq=0;
function resetWithdrawVerification(){
  withdrawReqSeq++;
  if(withdrawTimer){ clearTimeout(withdrawTimer); withdrawTimer=null; }
  withdrawVerified=false; withdrawVerifying=false; withdrawAcctName='';
  var load=document.getElementById('withdrawLoading'); if(load) load.style.display='none';
  var res=document.getElementById('withdrawResult'); if(res) res.style.display='none';
  var conf=document.getElementById('withdrawConfirmBtn'); if(conf) conf.style.display='none';
  var amtBox=document.getElementById('withdrawAmountBox'); if(amtBox) amtBox.style.display='none';
  setWithdrawAmountStatus('');
  var vb=document.getElementById('withdrawVerifyBtn'); if(vb){ vb.style.display='inline-flex'; vb.textContent='Verify Account with Paystack'; }
  var sec=document.getElementById('withdrawSecure'); if(sec) sec.style.display='';
  setWithdrawStatus('');
}
function showWithdrawAmountStep(){
  if(!withdrawVerified || remainingBalance()<=0) return;
  var conf=document.getElementById('withdrawConfirmBtn'); if(conf) conf.style.display='none';
  var amtBox=document.getElementById('withdrawAmountBox'); if(amtBox) amtBox.style.display='block';
  setWithdrawAmountStatus('');
  var amt=document.getElementById('wAmount'); if(amt) setTimeout(function(){ amt.focus(); },60);
  if(typeof saveDraft==='function') saveDraft();
}
/* Real Paystack account validation, via the server only.
   The browser POSTs {account_number, bank_code} to
   /api/resolve-account; that endpoint calls Paystack with the
   secret key held server-side and returns the account name.
   The name shown here is ONLY the name that endpoint returns —
   there is no fallback to the applicant's form name or any
   other local name. If the endpoint is unavailable or returns
   an error, an error is shown and the account stays unverified. */
function verifyWithdrawAccount(auto){
  if(remainingBalance()<=0 || withdrawVerifying) return;
  var bankEl=document.getElementById('fWithdrawBank');
  var bank=bankEl?bankEl.value.trim():'';
  var acctEl=document.getElementById('wAcct');
  var acct=(acctEl?acctEl.value:'').replace(/\D/g,'');
  if(acctEl && acctEl.value!==acct) acctEl.value=acct;
  if(!bank){ if(!auto){ toast('Select your commercial bank'); setWithdrawStatus('Select your commercial bank first','err'); } return; }
  if(COMMERCIAL_BANKS.indexOf(bank)<0){ setWithdrawStatus('That bank is not a commercial bank — select a commercial bank','err'); toast('Select a commercial bank'); return; }
  if(!/^\d{10}$/.test(acct)){ if(!auto || acct.length===10){ setWithdrawStatus('Enter your 10-digit account number','err'); if(!auto) toast('Enter your 10-digit account number'); } return; }
  var bankCode=bankCodeFor(bank);
  if(!bankCode){ setWithdrawStatus('That bank cannot be verified right now — select another commercial bank','err'); return; }
  resetWithdrawVerification();
  var seq=withdrawReqSeq;
  withdrawVerifying=true;
  var vb2=document.getElementById('withdrawVerifyBtn'); if(vb2) vb2.style.display='none';
  var load=document.getElementById('withdrawLoading'); if(load) load.style.display='flex';
  var sec=document.getElementById('withdrawSecure'); if(sec) sec.style.display='none';
  setWithdrawStatus('');
  if(acctEl) acctEl.disabled=true;
  function verifyFailed(msg){
    if(seq!==withdrawReqSeq) return;
    withdrawVerifying=false; withdrawVerified=false; withdrawAcctName='';
    if(acctEl) acctEl.disabled=false;
    if(load) load.style.display='none';
    var res=document.getElementById('withdrawResult'); if(res) res.style.display='none';
    var conf=document.getElementById('withdrawConfirmBtn'); if(conf) conf.style.display='none';
    var vb3=document.getElementById('withdrawVerifyBtn'); if(vb3){ vb3.style.display='inline-flex'; vb3.textContent='Try Again — Verify Account with Paystack'; }
    if(sec) sec.style.display='';
    setWithdrawStatus(msg,'err');
  }
  var ctrl=(typeof AbortController!=='undefined')?new AbortController():null;
  var timeoutId=ctrl?setTimeout(function(){ try{ctrl.abort();}catch(e){} },20000):null;
  fetch('/api/resolve-account',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({account_number:acct,bank_code:bankCode}),
    signal:ctrl?ctrl.signal:undefined
  }).then(function(resp){
    return resp.text().then(function(text){
      var json=null;
      try{ json=text?JSON.parse(text):null; }catch(e){}
      if(!resp.ok){
        var em=(json&&(json.message||json.error))||'';
        throw new Error(em?('Verification failed: '+em):'Verification service returned an error ('+resp.status+')');
      }
      return json;
    });
  }).then(function(json){
    if(timeoutId) clearTimeout(timeoutId);
    if(seq!==withdrawReqSeq) return;
    var data=(json&&json.data)?json.data:json;
    var resolvedName=data?(data.account_name||data.accountName||''):'';
    resolvedName=String(resolvedName||'').trim();
    if(!resolvedName) throw new Error('Verification service did not return an account name');
    withdrawVerifying=false;
    if(acctEl) acctEl.disabled=false;
    if(load) load.style.display='none';
    withdrawVerified=true;
    withdrawAcctName=resolvedName.toUpperCase();
    var nameEl=document.getElementById('withdrawAcctName'); if(nameEl) nameEl.textContent=withdrawAcctName;
    var metaEl=document.getElementById('withdrawAcctMeta'); if(metaEl) metaEl.textContent=bank+' · '+acct;
    var res=document.getElementById('withdrawResult'); if(res) res.style.display='flex';
    var conf=document.getElementById('withdrawConfirmBtn'); if(conf) conf.style.display='inline-flex';
    setWithdrawStatus('Account verified','ok');
    if(typeof saveDraft==='function') saveDraft();
  }).catch(function(err){
    if(timeoutId) clearTimeout(timeoutId);
    if(seq!==withdrawReqSeq) return;
    var msg=(err && err.name==='AbortError')
      ? 'Account verification timed out — check your connection and try again'
      : 'Account could not be verified — '+(err&&err.message?err.message:'verification service is unavailable')+'. Check the bank and account number, then try again.';
    verifyFailed(msg);
  });
}
function makeWithdrawRef(){
  return 'FGSG-WD-2026-'+Math.floor(1000+Math.random()*9000)+'-'+(withdrawHistory.length+1);
}
function queueWithdraw(){
  if(!withdrawVerified || remainingBalance()<=0) return;
  var remaining=remainingBalance();
  var amount=withdrawAmountValue();
  if(!amount){ setWithdrawAmountStatus('Type the amount to withdraw','err'); toast('Type the amount to withdraw'); return; }
  if(amount>remaining){ setWithdrawAmountStatus('Amount cannot be more than your remaining balance of '+formatNairaAmt(remaining),'err'); toast('Amount cannot be more than '+formatNairaAmt(remaining)); return; }
  setWithdrawAmountStatus('');
  var bank=document.getElementById('fWithdrawBank').value.trim();
  var acct=(document.getElementById('wAcct')?document.getElementById('wAcct').value:'').replace(/\D/g,'');
  var nameAtQueue=withdrawAcctName;
  var proc=document.getElementById('withdrawProcessing');
  var procText=document.getElementById('withdrawProcessingText');
  if(procText) procText.textContent='Queueing '+formatNairaAmt(amount)+'…';
  var amtBox=document.getElementById('withdrawAmountBox'); if(amtBox) amtBox.style.display='none';
  if(proc) proc.style.display='flex';
  withdrawProcessingTimer=setTimeout(function(){
    withdrawProcessingTimer=null;
    if(proc) proc.style.display='none';
    var wdRef=makeWithdrawRef();
    withdrawHistory.push({amount:amount,bank:bank,acct:acct,name:nameAtQueue,ts:Date.now(),ref:wdRef});
    withdrawTotal=(withdrawTotal||0)+amount;
    withdrawQueuedAmt=amount;
    withdrawDone=withdrawTotal>=50000;
    withdrawJustQueued=true;
    /* Mirror this withdrawal to Supabase: a withdrawals row
       (status queued) plus its transaction row, balance after. */
    if(typeof fgsgResolveApplicationId==='function' && typeof fgsgSync==='function'){
      var balAfterWd=50000-withdrawTotal;
      fgsgSync('withdrawal', fgsgResolveApplicationId(draftAppRef).then(function(appId){
        var jobs=[];
        if(typeof fgsgSaveWithdrawal==='function') jobs.push(fgsgSaveWithdrawal(appId, amount, bank, bankCodeFor(bank), acct, nameAtQueue));
        if(typeof fgsgAddTransaction==='function') jobs.push(fgsgAddTransaction(appId, 'withdrawal', 'out', amount, wdRef, balAfterWd));
        return Promise.all(jobs);
      }));
    }
    var amtEl=document.getElementById('wAmount'); if(amtEl) amtEl.value='';
    if(typeof saveDraft==='function') saveDraft();
    renderGrantState();
    toast(formatNairaAmt(amount)+' queued · '+formatNairaAmt(remainingBalance())+' left in wallet');
    var card=document.getElementById('withdrawCard'); if(card) card.scrollIntoView({behavior:'smooth',block:'center'});
  },1600);
}
function confirmWithdraw(){ queueWithdraw(); }
/* ---------- Transaction history + receipts ----------
   Every movement on the wallet, oldest first here and shown
   newest first: the ₦3,000 verification fee sent for processing,
   the ₦50,000 grant received, then every withdrawal. Tapping a
   row opens its receipt. */
function buildTransactions(){
  var txs=[];
  if(feeDone){
    txs.push({id:'fee',kind:'fee',title:'Verification Fee Sent',subtitle:'Processing fee · Paystack',amount:3000,dir:'fee',status:'Completed',statusClass:'done',ts:draftFeePaidAt||draftSubmittedAt||0,ref:draftFeeRef||'',
      rows:[['Type','Verification fee'],['Paid through','Paystack'],['Amount',formatMoneyFull(3000)],['Status','Completed'],['Date',formatTxDate(draftFeePaidAt||draftSubmittedAt||0)],['Reference',draftFeeRef||'—']],
      note:'This one-time fee was sent for processing and verification of your application.'});
  }
  if(isGrantApproved()){
    txs.push({id:'grant',kind:'grant',title:'Grant Received',subtitle:'Federal Government Student Grant',amount:50000,dir:'in',status:'Completed',statusClass:'done',ts:draftSubmittedAt+GRANT_WAIT_MS,ref:draftAppRef||'',balanceAfter:50000,
      rows:[['Type','Grant credit'],['From','Federal Government Student Grant'],['To','Grant Wallet · '+getOrCreateWalletId()],['Amount',formatMoneyFull(50000)],['Status','Completed'],['Date',formatTxDate(draftSubmittedAt+GRANT_WAIT_MS)],['Reference',draftAppRef||'—'],['Wallet balance after',formatMoneyFull(50000)]],
      note:'The ₦50,000 grant was credited to your Grant Wallet after your application was approved.'});
  }
  var cum=0;
  withdrawHistory.forEach(function(w,i){
    cum+=w.amount;
    var balAfter=50000-cum;
    txs.push({id:'wd-'+i,kind:'withdrawal',title:'Withdrawal to Bank',subtitle:(w.bank||'Bank')+' ····'+String(w.acct||'').slice(-4),amount:w.amount,dir:'out',status:'Queued',statusClass:'queued',ts:w.ts||0,ref:w.ref||'',balanceAfter:balAfter,
      rows:[['Type','Withdrawal'],['From','Grant Wallet · '+getOrCreateWalletId()],['To bank',w.bank||'—'],['Account number',w.acct||'—'],['Account name',w.name||'—'],['Amount',formatMoneyFull(w.amount)],['Status','Queued'],['Date',formatTxDate(w.ts||0)],['Reference',w.ref||'—'],['Wallet balance after',formatMoneyFull(balAfter)]],
      note:'This withdrawal is queued for processing to the bank account shown above. The amount has left your Grant Wallet.'});
  });
  return txs;
}
var TX_ICONS={
  in:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v13"/><path d="m6 11 6 6 6-6"/><path d="M4 21h16"/></svg>',
  out:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V7"/><path d="m6 13 6-6 6 6"/><path d="M4 3h16"/></svg>',
  fee:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/></svg>'
};
var currentTxById={};
function renderTxHistory(){
  var list=document.getElementById('txList'); if(!list) return;
  var empty=document.getElementById('txEmpty');
  var count=document.getElementById('txCount');
  var balRow=document.getElementById('txBalanceRow'), balEl=document.getElementById('txBalance');
  var txs=buildTransactions();
  currentTxById={};
  txs.forEach(function(tx){ currentTxById[tx.id]=tx; });
  list.innerHTML='';
  if(count) count.textContent=txs.length?(txs.length+(txs.length===1?' transaction':' transactions')):'';
  if(balRow&&balEl){
    if(isGrantApproved()){ balRow.style.display='flex'; balEl.textContent=formatMoneyFull(remainingBalance()); }
    else balRow.style.display='none';
  }
  if(!txs.length){ if(empty) empty.style.display='block'; return; }
  if(empty) empty.style.display='none';
  txs.slice().reverse().forEach(function(tx){
    var b=document.createElement('button'); b.type='button'; b.className='tx-row'; b.dataset.txId=tx.id;
    var sign=tx.dir==='in'?'+':(tx.dir==='out'?'−':'');
    b.innerHTML='<span class="tx-ic '+tx.dir+'">'+TX_ICONS[tx.dir]+'</span>'+
      '<span class="tx-main"><b>'+escTx(tx.title)+'</b><span>'+escTx(tx.subtitle)+'</span><span class="tx-date">'+escTx(formatTxDate(tx.ts))+'</span></span>'+
      '<span class="tx-side"><b class="'+tx.dir+'">'+sign+escTx(formatNairaAmt(tx.amount))+'</b><span class="tx-status '+tx.statusClass+'">'+escTx(tx.status)+'</span></span>'+
      '<span class="tx-chev" aria-hidden="true">›</span>';
    b.addEventListener('click',function(){ openReceipt(tx.id); });
    list.appendChild(b);
  });
  var homeTx=document.getElementById('homeTxBtn');
  if(homeTx) homeTx.style.display=txs.length?'inline-flex':'none';
}
function openReceipt(txId){
  var tx=currentTxById[txId]||buildTransactions().filter(function(t){return t.id===txId;})[0];
  if(!tx) return;
  currentTxById[tx.id]=tx;
  var ov=document.getElementById('receiptOverlay'); if(!ov) return;
  var icon=document.getElementById('receiptIcon');
  if(icon){
    icon.className='receipt-icon'+(tx.statusClass==='queued'?' queued':'');
    icon.innerHTML=tx.statusClass==='queued'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>'
      : '✓';
  }
  var amt=document.getElementById('receiptAmount');
  if(amt){ amt.textContent=(tx.dir==='in'?'+':(tx.dir==='out'?'−':''))+formatMoneyFull(tx.amount); amt.className='receipt-amount'+(tx.dir==='in'?' in':''); }
  var tt=document.getElementById('receiptTxTitle'); if(tt) tt.textContent=tx.title+' · '+tx.subtitle;
  var st=document.getElementById('receiptStatus');
  if(st){ st.textContent=tx.status; st.className='receipt-status '+tx.statusClass; }
  var rows=document.getElementById('receiptRows');
  if(rows){
    rows.innerHTML='';
    tx.rows.forEach(function(r){
      var d=document.createElement('div'); d.className='receipt-row';
      var s=document.createElement('span'); s.textContent=r[0];
      var bb=document.createElement('b'); bb.textContent=r[1];
      d.appendChild(s); d.appendChild(bb); rows.appendChild(d);
    });
  }
  var note=document.getElementById('receiptNote'); if(note) note.textContent=tx.note||'';
  ov.classList.add('open');
}
function closeReceipt(){
  var ov=document.getElementById('receiptOverlay'); if(ov) ov.classList.remove('open');
}
function renderWithdrawState(){
  var approved=isGrantApproved();
  var remaining=remainingBalance();
  var fullyOut=approved && withdrawTotal>=50000;
  var locked=document.getElementById('withdrawLocked');
  var body=document.getElementById('withdrawBody');
  var doneBox=document.getElementById('withdrawDone');
  var homeBtn=document.getElementById('homeWithdrawBtn');
  var bankBtn=document.getElementById('bankWithdrawBtn');
  var headAmt=document.getElementById('withdrawHeadAmt');
  if(headAmt) headAmt.textContent=approved?('₦'+remaining.toLocaleString('en-NG')+' available'):'₦50,000';
  var showWithdrawBtn=approved && remaining>0;
  if(homeBtn) homeBtn.style.display=showWithdrawBtn?'inline-flex':'none';
  if(bankBtn) bankBtn.style.display=showWithdrawBtn?'inline-flex':'none';
  if(!locked||!body||!doneBox) return;
  if(approved && (fullyOut || withdrawJustQueued)){
    /* Just queued (or wallet fully withdrawn): show the Queued
       panel for the latest withdrawal. If money remains, it
       offers Withdraw Again — the balance stays in the wallet. */
    var last=withdrawHistory[withdrawHistory.length-1];
    locked.style.display='none'; body.style.display='none'; doneBox.style.display='flex';
    var dt=document.getElementById('withdrawDoneText');
    if(dt && last) dt.textContent=formatNairaAmt(last.amount)+' queued for '+(last.bank||'your bank')+(last.acct?' · '+last.acct:'')+(last.name?' · '+last.name:'');
    var rem=document.getElementById('withdrawRemainingText');
    if(rem){
      if(remaining>0){ rem.style.display='block'; rem.textContent=formatMoneyFull(remaining)+' still in your Grant Wallet'; }
      else { rem.style.display='none'; rem.textContent=''; }
    }
    var again=document.getElementById('withdrawAgainBtn');
    if(again) again.style.display=remaining>0?'inline-flex':'none';
    return;
  }
  doneBox.style.display='none';
  if(approved){
    locked.style.display='none'; body.style.display='block';
  } else {
    body.style.display='none'; locked.style.display='flex';
    var lt=document.getElementById('withdrawLockedText');
    if(lt) lt.textContent='Available after approval';
  }
}
function renderGrantState(){
  var submitted=isSubmitted(), approved=isGrantApproved();
  /* The moment the background 24h wait completes and the grant
     is credited, mirror the ₦50,000 grant transaction to
     Supabase — once per application (flag kept per account). */
  if(approved && typeof fgsgResolveApplicationId==='function' && typeof fgsgSync==='function'){
    var grantSyncKey='fgsg_grant_tx_synced_v1_'+draftAppRef;
    var grantSynced=false;
    try{ grantSynced=!!localStorage.getItem(grantSyncKey); }catch(e){}
    if(!grantSynced){
      try{ localStorage.setItem(grantSyncKey,'1'); }catch(e){}
      fgsgSync('grant transaction', fgsgResolveApplicationId(draftAppRef).then(function(appId){
        if(typeof fgsgAddTransaction==='function') return fgsgAddTransaction(appId, 'grant', 'in', 50000, draftAppRef, 50000);
      }));
    }
  }
  var bal=approved?formatMoneyFull(remainingBalance()):'₦0.00';
  var homeBal=document.getElementById('homeWalletBal'); if(homeBal) homeBal.textContent=bal;
  var bankBal=document.getElementById('walletBal'); if(bankBal) bankBal.textContent=bal;
  var homeStatus=document.getElementById('homeWalletStatus');
  var bankStatus=document.getElementById('walletStatus');
  if(approved && withdrawTotal>=50000){
    if(homeStatus) homeStatus.textContent='Status · Queued';
    if(bankStatus) bankStatus.textContent='Queued';
  } else if(approved && withdrawTotal>0){
    if(homeStatus) homeStatus.textContent='Status · '+formatNairaAmt(remainingBalance())+' available';
    if(bankStatus) bankStatus.textContent=formatNairaAmt(withdrawTotal)+' withdrawn · '+formatNairaAmt(remainingBalance())+' available';
  } else if(approved){
    if(homeStatus) homeStatus.textContent='Status · Approved';
    if(bankStatus) bankStatus.textContent='Approved — Grant credited';
  } else if(submitted){
    if(homeStatus) homeStatus.textContent='Status · Pending';
    if(bankStatus && step>=7) bankStatus.textContent='Pending — Waiting for Approval';
  }
  var badge=document.getElementById('pendingBadge'), title=document.getElementById('pendingTitle'), icon=document.getElementById('pendingIcon');
  if(badge&&title&&icon&&submitted){
    if(approved){
      badge.textContent='Approved'; badge.classList.add('approved');
      title.textContent='Grant Credited';
      icon.classList.add('approved'); icon.innerHTML='✓';
      var sum=document.getElementById('successSummary');
      if(sum && sum.textContent.indexOf('Pending')>=0) sum.textContent=sum.textContent.replace('Pending — Waiting for Approval','Approved — Grant Credited');
      if(step===8) document.getElementById('stepTitle').textContent='Approved — Grant Credited';
    } else {
      badge.textContent='Pending'; badge.classList.remove('approved');
      title.textContent='Waiting for Approval';
      icon.classList.remove('approved');
    }
  }
  /* A submitted application is locked: no restart, no cancel, no reapply. */
  var rb=document.getElementById('restartAppBtn');
  if(rb && submitted){ rb.style.display='none'; }
  renderWithdrawState();
  if(typeof renderTxHistory==='function') renderTxHistory();
}
setInterval(function(){ renderGrantState(); },30000);
function draftKey(){
  var u=(window.FGSGAuth && FGSGAuth.currentUser())?FGSGAuth.currentUser():null;
  var e=u?u.email:(document.getElementById('fEmail').value||'').trim().toLowerCase();
  return 'fgsg_draft_v1_'+(e||'guest');
}
function draftHasProgress(d){
  return d.step>1||!!(d.name||d.dob||d.state||d.lga||d.type||d.level||d.school||d.dept||d.nin||d.liveDone||d.feeDone||d.jambName||d.feesName||d.ninName||d.matric||d.cgpa||d.resultName||d.studentIdName||d.originName||d.birthName||d.passportName||d.parentsStatus||d.phone||d.noOtherScholarship||d.submittedAt||d.withdrawBank||d.withdrawAcct||d.withdrawDone||d.withdrawQueuedAmt||d.withdrawAmtText||d.withdrawTotal||(d.withdrawHistory&&d.withdrawHistory.length)||d.feePaidAt);
}
function collectDraft(){
  var wBankEl=document.getElementById('fWithdrawBank'), wAcctEl=document.getElementById('wAcct'), wAmtEl=document.getElementById('wAmount');
  var noSchEl=document.getElementById('fNoOtherScholarship');
  return {v:2,step:step,name:val('fName'),dob:val('fDob'),state:val('fState'),lga:val('fLga'),type:val('fType'),level:val('fLevel'),school:val('fSchool'),dept:val('fDept'),nin:val('fNin'),matric:val('fMatric'),cgpa:val('fCgpa'),resultName:draftResultName,studentIdName:draftStudentIdName,originName:draftOriginName,birthName:draftBirthName,passportName:draftPassportName,parentsStatus:val('fParentsStatus'),phone:val('fPhone'),noOtherScholarship:!!(noSchEl&&noSchEl.checked),pay:'Grant Wallet',liveDone:!!liveDone,feeDone:!!feeDone,feePaidAt:draftFeePaidAt||0,feeRef:draftFeeRef||'',jambName:draftJambName,feesName:draftFeesName,ninName:draftNinName,appRef:draftAppRef,submitted:step===8&&!!draftAppRef,submittedAt:draftSubmittedAt||0,withdrawBank:wBankEl?wBankEl.value.trim():'',withdrawAcct:wAcctEl?wAcctEl.value.trim():'',withdrawName:withdrawAcctName||'',withdrawVerified:!!withdrawVerified,withdrawDone:!!withdrawDone,withdrawQueuedAmt:withdrawQueuedAmt||0,withdrawTotal:withdrawTotal||0,withdrawHistory:withdrawHistory||[],withdrawAmtText:wAmtEl?wAmtEl.value.trim():''};
}
function saveDraft(){
  try{
    var d=collectDraft(), key=draftKey(), note=document.getElementById('draftSaved');
    if(!draftHasProgress(d)){ localStorage.removeItem(key); if(note) note.textContent=''; return; }
    localStorage.setItem(key,JSON.stringify(d));
    if(note) note.textContent='Saved ✓';
  }catch(e){}
}
function setField(id,v){ var el=document.getElementById(id); if(el) el.value=v||''; }
function restoreDraft(){
  var key=draftKey();
  if(draftRestoredFor===key) return;
  draftRestoredFor=key;
  var d=null;
  try{ var raw=localStorage.getItem(key); if(raw) d=JSON.parse(raw); }catch(e){}
  if(!d) return;
  setField('fName',d.name); setField('fDob',d.dob); setField('fNin',d.nin);
  setField('fMatric',d.matric); setField('fCgpa',d.cgpa);
  setField('fParentsStatus',d.parentsStatus); setField('fPhone',d.phone);
  var noSchRestore=document.getElementById('fNoOtherScholarship'); if(noSchRestore) noSchRestore.checked=!!d.noOtherScholarship;
  if(d.state) pickerSetValue('state',d.state);
  if(d.lga) pickerSetValue('lga',d.lga);
  if(d.type) pickerSetValue('type',d.type);
  if(d.level) pickerSetValue('level',d.level);
  if(d.school) pickerSetValue('school',d.school);
  if(d.dept) pickerSetValue('dept',d.dept);
  if(d.withdrawBank) pickerSetValue('wbank',d.withdrawBank);
  var wAcctRestore=document.getElementById('wAcct'); if(wAcctRestore && d.withdrawAcct) wAcctRestore.value=d.withdrawAcct;
  var wAmtRestore=document.getElementById('wAmount'); if(wAmtRestore && d.withdrawAmtText) wAmtRestore.value=d.withdrawAmtText;
  draftFeePaidAt=+d.feePaidAt||0;
  draftFeeRef=d.feeRef||'';
  withdrawHistory=Array.isArray(d.withdrawHistory)?d.withdrawHistory:[];
  withdrawTotal=+d.withdrawTotal||0;
  if(!withdrawHistory.length && d.withdrawDone && +d.withdrawQueuedAmt){
    /* Migration: drafts saved before partial withdrawals kept
       only one queued amount — turn it into a history entry. */
    withdrawHistory=[{amount:+d.withdrawQueuedAmt,bank:d.withdrawBank||'',acct:d.withdrawAcct||'',name:d.withdrawName||'',ts:d.submittedAt||Date.now(),ref:'FGSG-WD-2026-LEGACY-1'}];
    withdrawTotal=+d.withdrawQueuedAmt;
  }
  if(!withdrawTotal && withdrawHistory.length){
    withdrawTotal=withdrawHistory.reduce(function(s,w){return s+(+w.amount||0);},0);
  }
  withdrawQueuedAmt=withdrawHistory.length?+withdrawHistory[withdrawHistory.length-1].amount||0:(+d.withdrawQueuedAmt||0);
  withdrawDone=withdrawTotal>=50000;
  withdrawJustQueued=false;
  /* Verified state is NOT restored: the account name must come
     from a fresh /api/resolve-account call in this session, so
     a saved name is never presented as freshly verified. The
     bank and account number stay filled in for re-verifying. */
  withdrawVerified=false; withdrawAcctName='';
  /* Payout is always the Grant Wallet — older drafts that
     saved a payout choice or bank details are ignored. */
  var payVal='Grant Wallet';
  draftJambName=d.jambName||''; draftFeesName=d.feesName||''; draftNinName=d.ninName||'';
  draftResultName=d.resultName||''; draftStudentIdName=d.studentIdName||'';
  draftOriginName=d.originName||''; draftBirthName=d.birthName||''; draftPassportName=d.passportName||'';
  if(draftJambName){ var okJ=document.getElementById('okJamb'); okJ.style.display='block'; okJ.textContent='✓ '+draftJambName+' attached'; }
  if(draftFeesName){ var okF=document.getElementById('okFees'); okF.style.display='block'; okF.textContent='✓ '+draftFeesName+' attached'; }
  if(draftNinName){ var okN=document.getElementById('okNin'); if(okN){ okN.style.display='block'; okN.textContent='✓ '+draftNinName+' attached'; } }
  [['draftResultName','okResult'],['draftStudentIdName','okStudentId'],['draftOriginName','okOrigin'],['draftBirthName','okBirth'],['draftPassportName','okPassport']].forEach(function(pair){
    var nm=pair[0]==='draftResultName'?draftResultName:pair[0]==='draftStudentIdName'?draftStudentIdName:pair[0]==='draftOriginName'?draftOriginName:pair[0]==='draftBirthName'?draftBirthName:draftPassportName;
    if(nm){ var okEl=document.getElementById(pair[1]); if(okEl){ okEl.style.display='block'; okEl.textContent='✓ '+nm+' attached'; } }
  });
  if(d.liveDone){ liveDone=true; if(typeof liveSetEntry==='function'){ liveSetEntry('✓ Liveness confirmed','ok'); document.getElementById('liveOpenBtn').textContent='Scan Again'; } }
  if(d.feeDone){ feeDone=true; document.getElementById('feeBtn').textContent='Paid via Paystack ✓ — ₦3,000'; var fp=document.getElementById('feePending'); if(fp) fp.style.display='flex'; document.getElementById('walletStatus').textContent='Pending — Waiting for Approval'; }
  draftAppRef=d.appRef||'';
  draftSubmittedAt=+d.submittedAt||0;
  /* Older drafts submitted before the background wait existed:
     start the wait from restore so they still credit later. */
  if(d.submitted && draftAppRef && !draftSubmittedAt){ draftSubmittedAt=Date.now(); }
  if(d.submitted && draftAppRef){
    document.getElementById('refCode').textContent=draftAppRef;
    var nm=(d.name||'Applicant'), sc=(d.school||'your institution');
    document.getElementById('successSummary').textContent=nm.split(' ')[0]+' · '+sc+' · '+payVal+' · ₦50,000 Grant · Pending — Waiting for Approval';
    document.getElementById('bankSummary').innerHTML='<b>Grant Wallet</b>';
    document.getElementById('walletStatus').textContent='Pending — Waiting for Approval';
  }
  step=Math.min(9,Math.max(1,+d.step||1));
  /* Drafts saved before Academic (4) and Background (5) were
     added used the old numbering — shift their later steps
     forward so a reopened draft lands on the same screen.
     Drafts saved while the payout choice was still Step 8
     land on the fee step (7) if unsubmitted, and the old
     submitted screen (9) is now Step 8. */
  if(d.v!==2 && !d.submitted){ if(step===4) step=6; else if(step===5) step=7; else if(step===6) step=7; else if(step===7) step=8; }
  else if(!d.submitted){ if(step===8) step=7; else if(step===9) step=8; }
  /* Locked: a submitted application always reopens on its
     submitted screen, never back on an editable step. */
  if(d.submitted && draftAppRef) step=8;
  renderStep();
  renderGrantState();
  var note=document.getElementById('draftSaved'); if(note && draftHasProgress(d)) note.textContent='Saved ✓';
  saveDraft();
}
var restartArmed=false, restartArmTimer=null;
function setRestartArmed(armed){
  restartArmed=!!armed;
  [['restartAppBtn','Cancel & Restart Application']].forEach(function(pair){
    var b=document.getElementById(pair[0]); if(!b) return;
    b.classList.toggle('armed',restartArmed);
    b.textContent=restartArmed?'Tap again to confirm restart':pair[1];
  });
  if(restartArmTimer){ clearTimeout(restartArmTimer); restartArmTimer=null; }
  if(restartArmed){
    restartArmTimer=setTimeout(function(){ setRestartArmed(false); },4000);
  }
}
function restartApplication(){
  /* Locked ONLY after submission: a submitted application cannot
     be restarted, cancelled or replaced. Before submission — on
     any step — Cancel & Restart clears the draft and starts over. */
  if(isSubmitted()||step===8){ toast('Application already submitted — it cannot be cancelled or restarted'); return; }
  if(!restartArmed){ setRestartArmed(true); return; }
  setRestartArmed(false);
  var btn=document.getElementById('restartAppBtn');
  try{ localStorage.removeItem(draftKey()); }catch(e){}
  ['fName','fDob','fState','fLga','fType','fLevel','fSchool','fDept','fNin','fMatric','fCgpa','fParentsStatus','fPhone','fWithdrawBank'].forEach(function(id){ setField(id,''); });
  var noSchClear=document.getElementById('fNoOtherScholarship'); if(noSchClear) noSchClear.checked=false;
  var wAcctClear=document.getElementById('wAcct'); if(wAcctClear) wAcctClear.value='';
  var wAmtClear=document.getElementById('wAmount'); if(wAmtClear) wAmtClear.value='';
  withdrawDone=false; withdrawQueuedAmt=0; withdrawAcctName=''; withdrawTotal=0; withdrawHistory=[]; withdrawJustQueued=false; draftFeePaidAt=0; draftFeeRef=''; if(typeof resetWithdrawVerification==='function') resetWithdrawVerification();
  Object.keys(PICKER_DEFS).forEach(function(k){ var def=PICKER_DEFS[k]; var t=document.getElementById(def.text); if(t){ t.textContent=def.placeholder; t.classList.add('ph'); } });
  draftJambName=''; draftFeesName=''; draftNinName=''; draftResultName=''; draftStudentIdName=''; draftOriginName=''; draftBirthName=''; draftPassportName=''; draftAppRef=''; draftSubmittedAt=0;
  ['upJamb','upFees','upNin','upResult','upStudentId','upOrigin','upBirth','upPassport'].forEach(function(id){ document.getElementById(id).value=''; });
  ['okJamb','okFees','okNin','okResult','okStudentId','okOrigin','okBirth','okPassport'].forEach(function(id){ document.getElementById(id).style.display='none'; });
  liveDone=false; if(typeof liveReset==='function') liveReset();
  feeDone=false;
  var fb=document.getElementById('feeBtn'); fb.disabled=false; fb.textContent='Pay ₦3,000';
  var fp2=document.getElementById('feePending'); if(fp2) fp2.style.display='none';
  var fs=document.getElementById('feeStatus'); if(fs) fs.textContent='';
  document.getElementById('walletStatus').textContent='Awaiting verification';
  var bs=document.getElementById('bankSummary'); if(bs) bs.textContent='Grant Wallet';
  var note2=document.getElementById('draftSaved'); if(note2) note2.textContent='';
  step=1; renderStep();
  window.scrollTo({top:document.getElementById('apply').offsetTop,behavior:'smooth'});
  toast('Application restarted');
}
var restartBtnEl=document.getElementById('restartAppBtn');
if(restartBtnEl) restartBtnEl.addEventListener('click',restartApplication);
var appFormEl=document.getElementById('appForm');
if(appFormEl){ appFormEl.addEventListener('input',saveDraft); appFormEl.addEventListener('change',saveDraft); }
window.addEventListener('pagehide',saveDraft);
window.addEventListener('load',function(){ restoreDraft(); renderWalletId(); renderGrantState(); if(typeof fgsgRefreshSerial==='function') fgsgRefreshSerial(); });
renderWalletId();
/* ---------- Withdraw Grant wiring ---------- */
var bankWithdrawBtnEl=document.getElementById('bankWithdrawBtn');
if(bankWithdrawBtnEl){ bankWithdrawBtnEl.addEventListener('click',function(){
  var card=document.getElementById('withdrawCard'); if(card) card.scrollIntoView({behavior:'smooth',block:'start'});
  var acct=document.getElementById('wAcct'); if(acct && !val('fWithdrawBank')){ var pb=document.querySelector('[data-picker="wbank"]'); if(pb) setTimeout(function(){ pb.focus(); },350); }
});}
var wAcctEl=document.getElementById('wAcct');
if(wAcctEl){
  wAcctEl.addEventListener('input',function(){
    var digits=wAcctEl.value.replace(/\D/g,'').slice(0,10);
    if(wAcctEl.value!==digits) wAcctEl.value=digits;
    if(withdrawVerified || withdrawVerifying){ resetWithdrawVerification(); }
    if(digits.length<10){ setWithdrawStatus(''); return; }
    if(digits.length===10){
      var bank=document.getElementById('fWithdrawBank').value.trim();
      if(!bank){ setWithdrawStatus('Select your commercial bank first','err'); return; }
      verifyWithdrawAccount(true);
    }
  });
  wAcctEl.addEventListener('blur',function(){
    var digits=(wAcctEl.value||'').replace(/\D/g,'');
    if(digits.length>0 && digits.length<10 && !withdrawVerifying){ setWithdrawStatus('Enter your 10-digit account number','err'); }
  });
}
var withdrawVerifyBtnEl=document.getElementById('withdrawVerifyBtn');
if(withdrawVerifyBtnEl){ withdrawVerifyBtnEl.addEventListener('click',function(){ verifyWithdrawAccount(false); }); }
var withdrawConfirmBtnEl=document.getElementById('withdrawConfirmBtn');
if(withdrawConfirmBtnEl){ withdrawConfirmBtnEl.addEventListener('click',showWithdrawAmountStep); }
var withdrawMaxBtnEl=document.getElementById('withdrawMaxBtn');
if(withdrawMaxBtnEl){ withdrawMaxBtnEl.addEventListener('click',function(){
  var rem=remainingBalance();
  var amt=document.getElementById('wAmount'); if(amt) amt.value=rem?rem.toLocaleString('en-NG'):'';
  setWithdrawAmountStatus(rem?('Full remaining balance · '+formatNairaAmt(rem)):'');
  if(typeof saveDraft==='function') saveDraft();
  var fin=document.getElementById('withdrawFinalBtn'); if(fin) fin.focus();
});}
var wAmountEl=document.getElementById('wAmount');
if(wAmountEl){
  wAmountEl.addEventListener('input',function(){
    var digits=wAmountEl.value.replace(/\D/g,'').slice(0,6);
    var formatted=digits?Number(digits).toLocaleString('en-NG'):'';
    if(wAmountEl.value!==formatted) wAmountEl.value=formatted;
    var rem=remainingBalance();
    if(digits && Number(digits)>rem) setWithdrawAmountStatus('Amount cannot be more than your remaining balance of '+formatNairaAmt(rem),'err');
    else setWithdrawAmountStatus('');
    if(typeof saveDraft==='function') saveDraft();
  });
}
var withdrawAgainBtnEl=document.getElementById('withdrawAgainBtn');
if(withdrawAgainBtnEl){ withdrawAgainBtnEl.addEventListener('click',function(){
  withdrawJustQueued=false;
  var amtBox=document.getElementById('withdrawAmountBox'); if(amtBox) amtBox.style.display='none';
  var amtEl2=document.getElementById('wAmount'); if(amtEl2) amtEl2.value='';
  renderGrantState();
  var card=document.getElementById('withdrawCard'); if(card) card.scrollIntoView({behavior:'smooth',block:'start'});
});}
var withdrawReceiptBtnEl=document.getElementById('withdrawReceiptBtn');
if(withdrawReceiptBtnEl){ withdrawReceiptBtnEl.addEventListener('click',function(){
  if(withdrawHistory.length) openReceipt('wd-'+(withdrawHistory.length-1));
});}
var receiptCloseEl=document.getElementById('receiptClose');
if(receiptCloseEl) receiptCloseEl.addEventListener('click',closeReceipt);
var receiptDoneEl=document.getElementById('receiptDoneBtn');
if(receiptDoneEl) receiptDoneEl.addEventListener('click',closeReceipt);
var receiptOverlayEl=document.getElementById('receiptOverlay');
if(receiptOverlayEl) receiptOverlayEl.addEventListener('click',function(e){ if(e.target===this) closeReceipt(); });
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){ var ov=document.getElementById('receiptOverlay'); if(ov && ov.classList.contains('open')) closeReceipt(); }
});
var withdrawFinalBtnEl=document.getElementById('withdrawFinalBtn');
if(withdrawFinalBtnEl){ withdrawFinalBtnEl.addEventListener('click',queueWithdraw); }
/* Tapping the verified result area re-checks if the details changed */
var withdrawResultEl=document.getElementById('withdrawResult');
if(withdrawResultEl){ /* result is display-only; confirmation is the button below it */ }
