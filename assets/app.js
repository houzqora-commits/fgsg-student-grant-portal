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
  bank:{title:'Bank Name',input:'fBank',text:'pickText-bank',placeholder:'Select bank…',search:'Search banks…',options:function(){return BANKS;}}
};
var pickerKey=null;
function pickerSetValue(key,value){
  var def=PICKER_DEFS[key]; if(!def) return;
  document.getElementById(def.input).value=value;
  var t=document.getElementById(def.text); t.textContent=value; t.classList.remove('ph');
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
  renderPickerList();
  document.getElementById('pickerOverlay').classList.add('open');
  setTimeout(function(){ try{s.focus();}catch(e){} },80);
}
function closePicker(){
  document.getElementById('pickerOverlay').classList.remove('open');
  pickerKey=null;
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
}

/* ---------- page routing: landing / auth / app are separate pages ---------- */
function goPage(page,authTab){
  /* proper auth check: the dashboard only opens with a live
     browser session — otherwise route to the Auth page */
  if(page==='app' && window.FGSGAuth && !FGSGAuth.currentUser()){
    toast('Log in or create an account first');
    page='auth'; if(!authTab) authTab='login';
  }
  if(page!=='app' && typeof liveRunning!=='undefined' && liveRunning && typeof liveReset==='function'){ liveReset(); }
  document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active')});
  var el=document.getElementById('page-'+page); if(el) el.classList.add('active');
  if(page==='auth' && authTab) switchAuthTab(authTab);
  window.scrollTo({top:0});
  if(page==='app'){ requestAnimationFrame(moveDockIndicator); setTimeout(moveDockIndicator,380); }
}
function goLandingAnchor(e,id){
  e.preventDefault(); goPage('landing');
  setTimeout(function(){ var t=document.getElementById(id); if(t) t.scrollIntoView({behavior:'smooth'}); },60);
}
function enterApp(view){ if(typeof restoreDraft==='function') restoreDraft(); renderWalletId(); goPage('app'); showView(view||'home'); }
function switchAuthTab(name){
  document.querySelectorAll('[data-auth-tab]').forEach(function(t){t.classList.toggle('on',t.dataset.authTab===name)});
  document.querySelectorAll('[data-auth-panel]').forEach(function(p){p.classList.toggle('on',p.dataset.authPanel===name)});
}
/* authLogin / authSignup / authForgot / authLogout live in
   auth.js, backed by the browser-built-in account store
   (FGSGAuth) with hashed passwords and real checks. */
/* dock highlighter: a sliding lime pill glides behind the active tab */
function moveDockIndicator(){
  var btn=document.querySelector('.dock button.active'), ind=document.getElementById('dockIndicator');
  if(!btn||!ind||!btn.offsetParent) return;
  ind.style.left=btn.offsetLeft+'px'; ind.style.width=btn.offsetWidth+'px';
}
window.addEventListener('resize',moveDockIndicator);
window.addEventListener('load',function(){ setTimeout(moveDockIndicator,60); });

/* view switching */
function showView(name){
  if(name!=='application' && typeof liveRunning!=='undefined' && liveRunning && typeof liveReset==='function'){ liveReset(); }
  document.querySelectorAll('.view').forEach(function(v){v.classList.remove('active')});
  var el=document.getElementById('view-'+name); if(el) el.classList.add('active');
  document.querySelectorAll('.dock button').forEach(function(b){b.classList.toggle('active',b.dataset.view===name)});
  requestAnimationFrame(moveDockIndicator);
  if(name==='me') renderProfile();
}
document.querySelectorAll('.dock button').forEach(function(b){b.addEventListener('click',function(){showView(b.dataset.view);});});

/* multi-step form — Step 1 is the start screen (no login
   re-confirmation: the user is already signed in), so the
   counted form steps are Personal (2) through Payout (6). */
var step=1, totalSteps=5, liveDone=false, feeDone=false;
var titles={1:'Start your application',2:'Personal details',3:'Institution & course',4:'Documents & identity',5:'Verification fee — Paystack',6:'Choose payout',7:'Pending — Waiting for Approval'};
function renderStep(){
  document.querySelectorAll('.fstep').forEach(function(f){f.classList.toggle('active',+f.dataset.step===step)});
  if(step===1){
    document.getElementById('stepTitle').textContent='Application — Start';
    document.getElementById('stepPct').textContent='0%';
    document.getElementById('pbar').style.width='0%';
  } else if(step===7){
    document.getElementById('stepTitle').textContent='Pending — Waiting for Approval';
    document.getElementById('stepPct').textContent='100%';
    document.getElementById('pbar').style.width='100%';
  } else {
    var shown=step-1;
    document.getElementById('stepTitle').textContent='Step '+shown+' of '+totalSteps+' — '+titles[step];
    var pct=Math.round(shown/totalSteps*100);
    document.getElementById('stepPct').textContent=pct+'%';
    document.getElementById('pbar').style.width=pct+'%';
  }
  document.getElementById('backBtn').style.visibility= step===1||step===7 ? 'hidden':'visible';
  document.getElementById('nextBtn').textContent= step===6 ? 'Submit Application ✓' : 'Continue →';
  document.getElementById('formNav').style.display= step===1||step===7 ? 'none':'flex';
  var rb=document.getElementById('restartAppBtn');
  if(rb){
    rb.style.display= step>1 ? 'inline-flex':'none';
    if(step===1){ delete rb.dataset.armed; rb.classList.remove('armed'); rb.textContent='Restart application'; }
  }
  if(step===5){ var pe=document.getElementById('psEmail'); if(pe) pe.textContent=(val('fEmail')||'you@example.com'); }
}
function val(id){return document.getElementById(id).value.trim();}
/* Step 1 is checked against the browser account store: the
   password must match the saved hash for that email, a new
   email creates the account (hashed), and a signed-in user
   whose email matches may continue without re-typing. */
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
      if(!ok) toast('That password does not match the account saved in this browser');
      return ok;
    });
  }
  var existing=FGSGAuth.findUser(email);
  if(existing){
    if(!pw){ toast('This email already has an account on this device — enter its password'); return Promise.resolve(false); }
    return FGSGAuth.verifyPassword(email,pw).then(function(ok){
      if(!ok){ toast('That password does not match the account saved in this browser'); return false; }
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
  if(step===2){ if(!val('fName')||!val('fDob')||!val('fState')||!val('fLga')){toast('Complete name, date of birth, state of origin and LGA');return false;} }
  if(step===3){ if(!val('fType')||!val('fLevel')||!val('fSchool')||!val('fDept')){toast('Complete institution type, level, institution and department');return false;} }
  if(step===4){ if(!document.getElementById('upJamb').files.length && !draftJambName){toast('Attach your JAMB admission letter');return false;} if(!document.getElementById('upFees').files.length && !draftFeesName){toast('Attach your last school fees receipt');return false;} var nin=val('fNin').replace(/\s/g,''); if(!/^\d{11}$/.test(nin)){toast('Enter 11 digits for NIN');return false;} if(!liveDone){toast('Run the liveness check to continue');return false;} }
  if(step===5){ if(!feeDone){toast('Pay the ₦3,000 verification fee with Paystack to continue');return false;} }
  return true;
}
var startAppBtn=document.getElementById('startAppBtn');
if(startAppBtn){ startAppBtn.addEventListener('click',function(){
  step=2; renderStep(); saveDraft();
  window.scrollTo({top:document.getElementById('apply').offsetTop,behavior:'smooth'});
});}
document.getElementById('nextBtn').addEventListener('click',function(){
  if(step<6){ if(!validateStep())return; step++; renderStep(); saveDraft(); window.scrollTo({top:document.getElementById('apply').offsetTop,behavior:'smooth'}); }
  else if(step===6){ submitApplication(); }
});
document.getElementById('backBtn').addEventListener('click',function(){ if(step>1){step--;renderStep();saveDraft();} });

/* uploads — the draft keeps the attached file names, because a page
   cannot refill a file input after a reload */
[['upJamb','okJamb'],['upFees','okFees']].forEach(function(pair){
  document.getElementById(pair[0]).addEventListener('change',function(e){ if(e.target.files.length){ var nm=e.target.files[0].name; if(pair[0]==='upJamb') draftJambName=nm; else draftFeesName=nm; var ok=document.getElementById(pair[1]); ok.style.display='block'; ok.textContent='✓ '+nm+' attached'; saveDraft(); }});
});

/* ---------- application draft: progress saves at every step ----------
   The draft lives in this browser only (localStorage), keyed by the
   signed-in email — the same device-only storage the accounts use.
   Closing the page mid-application and coming back restores the step
   and every answer, so an applicant who stopped at Step 3 reopens
   the form on Step 3 with their details filled in. Restart clears
   the draft for this account and returns the form to Step 1. */
var draftJambName='', draftFeesName='', draftAppRef='', draftRestoredFor=null;
function draftKey(){
  var u=(window.FGSGAuth && FGSGAuth.currentUser())?FGSGAuth.currentUser():null;
  var e=u?u.email:(document.getElementById('fEmail').value||'').trim().toLowerCase();
  return 'fgsg_draft_v1_'+(e||'guest');
}
function draftHasProgress(d){
  return d.step>1||!!(d.name||d.dob||d.state||d.lga||d.type||d.level||d.school||d.dept||d.nin||d.bank||d.acct||d.acctName||d.liveDone||d.feeDone||d.jambName||d.feesName);
}
function collectDraft(){
  var payEl=document.querySelector('input[name="pay"]:checked');
  return {step:step,name:val('fName'),dob:val('fDob'),state:val('fState'),lga:val('fLga'),type:val('fType'),level:val('fLevel'),school:val('fSchool'),dept:val('fDept'),nin:val('fNin'),pay:payEl?payEl.value:'Grant Wallet',bank:val('fBank'),acct:val('fAcct'),acctName:val('fAcctName'),liveDone:!!liveDone,feeDone:!!feeDone,jambName:draftJambName,feesName:draftFeesName,appRef:draftAppRef,submitted:step===7&&!!draftAppRef};
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
  setField('fAcct',d.acct); setField('fAcctName',d.acctName);
  if(d.state) pickerSetValue('state',d.state);
  if(d.lga) pickerSetValue('lga',d.lga);
  if(d.type) pickerSetValue('type',d.type);
  if(d.level) pickerSetValue('level',d.level);
  if(d.school) pickerSetValue('school',d.school);
  if(d.dept) pickerSetValue('dept',d.dept);
  if(d.bank) pickerSetValue('bank',d.bank);
  var payVal=d.pay||'Grant Wallet';
  document.querySelectorAll('input[name="pay"]').forEach(function(r){ r.checked=(r.value===payVal); });
  document.getElementById('bankFields').style.display= payVal==='Bank Account' ? 'grid':'none';
  draftJambName=d.jambName||''; draftFeesName=d.feesName||'';
  if(draftJambName){ var okJ=document.getElementById('okJamb'); okJ.style.display='block'; okJ.textContent='✓ '+draftJambName+' attached'; }
  if(draftFeesName){ var okF=document.getElementById('okFees'); okF.style.display='block'; okF.textContent='✓ '+draftFeesName+' attached'; }
  if(d.liveDone){ liveDone=true; if(typeof liveSetEntry==='function'){ liveSetEntry('✓ Liveness confirmed','ok'); document.getElementById('liveOpenBtn').textContent='Scan Again'; } }
  if(d.feeDone){ feeDone=true; document.getElementById('feeBtn').textContent='Paid via Paystack ✓ — ₦3,000'; var fp=document.getElementById('feePending'); if(fp) fp.style.display='flex'; document.getElementById('walletStatus').textContent='Pending — Waiting for Approval'; }
  draftAppRef=d.appRef||'';
  if(d.submitted && draftAppRef){
    document.getElementById('refCode').textContent=draftAppRef;
    var nm=(d.name||'Applicant'), sc=(d.school||'your institution');
    document.getElementById('successSummary').textContent=nm.split(' ')[0]+' · '+sc+' · '+payVal+' · Pending — Waiting for Approval';
    var esc=(typeof escapeHtml==='function')?escapeHtml:function(s){return String(s||'');};
    document.getElementById('bankSummary').innerHTML='<b>'+esc(payVal)+'</b>'+(payVal==='Bank Account'&&d.bank?' · <b>'+esc(d.bank)+'</b> •••'+esc((d.acct||'').slice(-3)||'000'):'');
    document.getElementById('walletStatus').textContent='Pending — Waiting for Approval';
  }
  step=Math.min(7,Math.max(1,+d.step||1));
  renderStep();
  var note=document.getElementById('draftSaved'); if(note && draftHasProgress(d)) note.textContent='Saved ✓';
  saveDraft();
}
function restartApplication(){
  var btn=document.getElementById('restartAppBtn');
  if(btn && !btn.dataset.armed){
    btn.dataset.armed='1'; btn.classList.add('armed'); btn.textContent='Tap again to restart';
    setTimeout(function(){ if(btn){ delete btn.dataset.armed; btn.classList.remove('armed'); btn.textContent='Restart application'; } },4000);
    return;
  }
  try{ localStorage.removeItem(draftKey()); }catch(e){}
  ['fName','fDob','fState','fLga','fType','fLevel','fSchool','fDept','fNin','fBank','fAcct','fAcctName'].forEach(function(id){ setField(id,''); });
  Object.keys(PICKER_DEFS).forEach(function(k){ var def=PICKER_DEFS[k]; var t=document.getElementById(def.text); if(t){ t.textContent=def.placeholder; t.classList.add('ph'); } });
  draftJambName=''; draftFeesName=''; draftAppRef='';
  ['upJamb','upFees'].forEach(function(id){ document.getElementById(id).value=''; });
  ['okJamb','okFees'].forEach(function(id){ document.getElementById(id).style.display='none'; });
  document.querySelectorAll('input[name="pay"]').forEach(function(r){ r.checked=(r.value==='Grant Wallet'); });
  document.getElementById('bankFields').style.display='none';
  liveDone=false; if(typeof liveReset==='function') liveReset();
  feeDone=false;
  var fb=document.getElementById('feeBtn'); fb.disabled=false; fb.textContent='Pay ₦3,000';
  var fp2=document.getElementById('feePending'); if(fp2) fp2.style.display='none';
  var fs=document.getElementById('feeStatus'); if(fs) fs.textContent='';
  document.getElementById('walletStatus').textContent='Awaiting verification';
  var bs=document.getElementById('bankSummary'); if(bs) bs.textContent='No payout method confirmed yet.';
  var note2=document.getElementById('draftSaved'); if(note2) note2.textContent='';
  if(btn){ delete btn.dataset.armed; btn.classList.remove('armed'); btn.textContent='Restart application'; }
  step=1; renderStep();
  window.scrollTo({top:document.getElementById('apply').offsetTop,behavior:'smooth'});
  toast('Application restarted');
}
var restartBtnEl=document.getElementById('restartAppBtn');
if(restartBtnEl) restartBtnEl.addEventListener('click',restartApplication);
var appFormEl=document.getElementById('appForm');
if(appFormEl){ appFormEl.addEventListener('input',saveDraft); appFormEl.addEventListener('change',saveDraft); }
window.addEventListener('pagehide',saveDraft);
window.addEventListener('load',function(){ restoreDraft(); renderWalletId(); });
renderWalletId();
