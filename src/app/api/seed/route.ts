// app/api/seed/route.ts
import { NextResponse } from "next/server";
import { prisma } from "~/lib/db";

// Industries data from your SQL
const industries = [
  { id: 1, name: "Hospitality" },
  { id: 2, name: "Public Road Transport" },
  { id: 3, name: "Construction & Real Estate" },
  { id: 4, name: "Home | Personal Care" },
  { id: 5, name: "Medical & Health Emergency Services" },
  { id: 6, name: "Fire & Rescue Services" },
  { id: 7, name: "Security & Safety Emergency Services" },
  { id: 8, name: "Technical & Infrastructure Emergency Services" },
  { id: 9, name: "Disaster & Environmental Emergency Services" },
  { id: 10, name: "Social & Human-Centered Emergency Services" },
];

// Services data from const_services table
const services = [
  // Construction & Real Estate (industry_id: 3)
  { industryId: 3, name: "DSTV Installation", description: "Professional DSTV installation services" },
  { industryId: 3, name: "Plumbing", description: "Pipe installation, repair, and maintenance services" },
  { industryId: 3, name: "Electrician", description: "Electrical installation, wiring, and repairs" },
  { industryId: 3, name: "HVAC Technician", description: "Air conditioning and refrigeration services" },
  { industryId: 3, name: "Carpentry", description: "Woodwork, furniture making, and repairs" },
  { industryId: 3, name: "Interior Decoration", description: "Interior design and decoration services" },
  { industryId: 3, name: "Painting", description: "Interior and exterior painting services" },
  { industryId: 3, name: "Welding", description: "Metal fabrication and welding services" },
  { industryId: 3, name: "Tile Installation and Cladding", description: "Tile laying and wall cladding" },
  { industryId: 3, name: "Architect", description: "Architectural design and planning" },
  { industryId: 3, name: "Surveyor", description: "Land and building surveying" },
  { industryId: 3, name: "Urban Planner", description: "Urban and regional planning" },
  { industryId: 3, name: "Doors Installation", description: "Door installation and repair" },
  { industryId: 3, name: "Windows Installation", description: "Window installation and repair" },
  { industryId: 3, name: "Plastering", description: "Wall plastering and finishing" },
  { industryId: 3, name: "Fences and Gates", description: "Fence and gate construction" },
  { industryId: 3, name: "Screed", description: "Floor screeding services" },
  { industryId: 3, name: "Shelters and Canopies", description: "Shelter and canopy construction" },
  { industryId: 3, name: "Pool Construction", description: "Swimming pool construction and maintenance" },
  { industryId: 3, name: "Cleaning Services", description: "Professional cleaning services" },
  { industryId: 3, name: "Gardener", description: "Gardening and landscaping" },
  { industryId: 3, name: "Other Services", description: "General handyman services" },
  { industryId: 3, name: "Roofer", description: "Roofing installation and repair" },
  
  // Hospitality (industry_id: 1)
  { industryId: 1, name: "Bartender", description: "Professional bartending services" },
  { industryId: 1, name: "Food Service Manager", description: "Food service management" },
  { industryId: 1, name: "Kitchen Manager", description: "Kitchen operations management" },
  { industryId: 1, name: "Waiter", description: "Food and beverage service" },
  { industryId: 1, name: "Hospital Food Service Supervisor", description: "Hospital food service supervision" },
  { industryId: 1, name: "Private Caterer", description: "Private catering services" },
  
  // Public Road Transport (industry_id: 2)
  { industryId: 2, name: "City Taxi Driver", description: "Professional taxi driving services" },
  { industryId: 2, name: "Car Mechanic", description: "Vehicle repair and maintenance" },
  { industryId: 2, name: "Car Painter", description: "Auto painting and finishing" },
  { industryId: 2, name: "Car Electrician", description: "Auto electrical services" },
  { industryId: 2, name: "Car Spare Part Dealer", description: "Auto spare parts sales" },
  
  // Home & Personal Care (industry_id: 4)
  { industryId: 4, name: "Baby Sitters (Nanny)", description: "Professional childcare services" },
  
  // Medical & Health Emergency (industry_id: 5)
  { industryId: 5, name: "Emergency Medical Technicians (EMTs)", description: "Emergency medical response" },
  { industryId: 5, name: "Ambulance & Patient Transport Services", description: "Ambulance services" },
  
  // Fire & Rescue Services (industry_id: 6)
  { industryId: 6, name: "Firefighting & Fire Response Technicians", description: "Fire response services" },
  { industryId: 6, name: "Search & Rescue (SAR) Personnel", description: "Search and rescue operations" },
  
  // Security & Safety (industry_id: 7)
  { industryId: 7, name: "Emergency Security Response (Private)", description: "Private security response" },
  { industryId: 7, name: "Crisis Intervention & Evacuation Teams", description: "Crisis management" },
  
  // Technical & Infrastructure (industry_id: 8)
  { industryId: 8, name: "Emergency Electricians", description: "Emergency electrical services" },
  { industryId: 8, name: "Emergency Plumbers & Gas Technicians", description: "Emergency plumbing and gas" },
  { industryId: 8, name: "Emergency Building & Structural Support", description: "Building emergency support" },
  
  // Disaster & Environmental (industry_id: 9)
  { industryId: 9, name: "Flood & Environmental Response Teams", description: "Flood response" },
  { industryId: 9, name: "Power & Utility Emergency Response", description: "Utility emergency response" },
  
  // Social & Human Services (industry_id: 10)
  { industryId: 10, name: "Mental Health Crisis Responders", description: "Mental health crisis response" },
  { industryId: 10, name: "Child, Gender & Vulnerable Persons Emergency Support", description: "Vulnerable persons support" },
];

// Requirements data from c_requirements table
const requirements = [
  // Baby Sitters (service_name: "Baby Sitters (Nanny)")
  { serviceName: "Baby Sitters (Nanny)", requirement: "First Aid Certificate", mandatory: true },
  { serviceName: "Baby Sitters (Nanny)", requirement: "CPR Certificate", mandatory: true },
  
  // Kitchen Manager
  { serviceName: "Kitchen Manager", requirement: "Hospitality Management Certificate", mandatory: true },
  
  // Waiter
  { serviceName: "Waiter", requirement: "Hospitality Management Certificate", mandatory: true },
  
  // Hospital Food Service Supervisor
  { serviceName: "Hospital Food Service Supervisor", requirement: "Hospitality Management Certificate", mandatory: true },
  
  // Private Caterer
  { serviceName: "Private Caterer", requirement: "Hospitality Management Certificate", mandatory: true },
  
  // City Taxi Driver
  { serviceName: "City Taxi Driver", requirement: "Driver's License", mandatory: true },
  { serviceName: "City Taxi Driver", requirement: "First Aid Certificate", mandatory: true },
  { serviceName: "City Taxi Driver", requirement: "CPR Certificate", mandatory: true },
  
  // Bartender
  { serviceName: "Bartender", requirement: "Hospitality Management Certificate", mandatory: true },
  
  // Food Service Manager
  { serviceName: "Food Service Manager", requirement: "Hospitality Management Certificate", mandatory: true },
  
  // Electrician
  { serviceName: "Electrician", requirement: "Trade Test Certificate", mandatory: true },
  { serviceName: "Electrician", requirement: "NAPTEB/NVQ Certificate", mandatory: true },
  { serviceName: "Electrician", requirement: "COREN Registration", mandatory: false },
  
  // Plumber
  { serviceName: "Plumbing", requirement: "Trade Test Certificate", mandatory: true },
  { serviceName: "Plumbing", requirement: "NAPTEB/NVQ Certificate", mandatory: true },
  
  // Carpenter
  { serviceName: "Carpentry", requirement: "Trade Test Certificate", mandatory: true },
  { serviceName: "Carpentry", requirement: "NAPTEB/NVQ Certificate", mandatory: true },
  
  // Welder
  { serviceName: "Welding", requirement: "Trade Test Certificate", mandatory: true },
  { serviceName: "Welding", requirement: "NAPTEB/NVQ Certificate", mandatory: true },
  
  // HVAC Technician
  { serviceName: "HVAC Technician", requirement: "Trade Test Certificate", mandatory: true },
  { serviceName: "HVAC Technician", requirement: "NAPTEB/NVQ Certificate", mandatory: true },
  
  // Painter
  { serviceName: "Painting", requirement: "Trade Test Certificate", mandatory: true },
  
  // Tiler
  { serviceName: "Tile Installation and Cladding", requirement: "Trade Test Certificate", mandatory: true },
  
  // Car Mechanic
  { serviceName: "Car Mechanic", requirement: "Trade Test Certificate", mandatory: true },
  { serviceName: "Car Mechanic", requirement: "NAPTEB/NVQ Certificate", mandatory: true },
  
  // EMT
  { serviceName: "Emergency Medical Technicians (EMTs)", requirement: "Basic Life Support (BLS)", mandatory: true },
  { serviceName: "Emergency Medical Technicians (EMTs)", requirement: "First Aid Certificate", mandatory: true },
  { serviceName: "Emergency Medical Technicians (EMTs)", requirement: "CPR Certificate", mandatory: true },
  
  // Firefighter
  { serviceName: "Firefighting & Fire Response Technicians", requirement: "Fire Safety Certificate", mandatory: true },
  { serviceName: "Firefighting & Fire Response Technicians", requirement: "First Aid Certificate", mandatory: true },
];

// Nigerian States with their Local Governments
const statesWithLGAs = [
  { name: "Abia", lg: ["Aba North", "Aba South", "Arochukwu", "Bende", "Ikwuano", "Isiala Ngwa North", "Isiala Ngwa South", "Isuikwuato", "Obi Ngwa", "Ohafia", "Osisioma", "Ugwunagbo", "Ukwa East", "Ukwa West", "Umuahia North", "Umuahia South", "Umu Nneochi"] },
  { name: "Adamawa", lg: ["Demsa", "Fufure", "Ganye", "Gayuk", "Gombi", "Grie", "Hong", "Jada", "Lamurde", "Madagali", "Maiha", "Mayo Belwa", "Michika", "Mubi North", "Mubi South", "Numan", "Shelleng", "Song", "Toungo", "Yola North", "Yola South"] },
  { name: "Akwa Ibom", lg: ["Abak", "Eastern Obolo", "Eket", "Esit Eket", "Essien Udim", "Etim Ekpo", "Etinan", "Ibeno", "Ibesikpo Asutan", "Ibiono Ibom", "Ika", "Ikono", "Ikot Abasi", "Ikot Ekpene", "Ini", "Itu", "Mbo", "Mkpat Enin", "Nsit-Atai", "Nsit-Ibom", "Nsit-Ubium", "Obot Akara", "Okobo", "Onna", "Oron", "Oruk Anam", "Udung-Uko", "Ukanafun", "Uruan", "Urue-Offong/Oruko", "Uyo"] },
  { name: "Anambra", lg: ["Aguata", "Anambra East", "Anambra West", "Anaocha", "Awka North", "Awka South", "Ayamelum", "Dunukofia", "Ekwusigo", "Idemili North", "Idemili South", "Ihiala", "Njikoka", "Nnewi North", "Nnewi South", "Ogbaru", "Onitsha North", "Onitsha South", "Orumba North", "Orumba South", "Oyi"] },
  { name: "Bauchi", lg: ["Alkaleri", "Bauchi", "Bogoro", "Damban", "Darazo", "Dass", "Gamawa", "Ganjuwa", "Giade", "Itas/Gadau", "Jama'are", "Katagum", "Kirfi", "Misau", "Ningi", "Shira", "Tafawa Balewa", "Toro", "Warji", "Zaki"] },
  { name: "Bayelsa", lg: ["Brass", "Ekeremor", "Kolokuma/Opokuma", "Nembe", "Ogbia", "Sagbama", "Southern Ijaw", "Yenagoa"] },
  { name: "Benue", lg: ["Ado", "Agatu", "Apa", "Buruku", "Gboko", "Guma", "Gwer East", "Gwer West", "Katsina-Ala", "Konshisha", "Kwande", "Logo", "Makurdi", "Obi", "Ogbadibo", "Ohimini", "Oju", "Okpokwu", "Otukpo", "Tarka", "Ukum", "Ushongo", "Vandeikya"] },
  { name: "Borno", lg: ["Abadam", "Askira/Uba", "Bama", "Bayo", "Biu", "Chibok", "Damboa", "Dikwa", "Gubio", "Guzamala", "Gwoza", "Hawul", "Jere", "Kaga", "Kala/Balge", "Konduga", "Kukawa", "Kwaya Kusar", "Mafa", "Magumeri", "Maiduguri", "Marte", "Mobbar", "Monguno", "Ngala", "Nganzai", "Shani"] },
  { name: "Cross River", lg: ["Abi", "Akamkpa", "Akpabuyo", "Bakassi", "Bekwarra", "Biase", "Boki", "Calabar Municipal", "Calabar South", "Etung", "Ikom", "Obanliku", "Obubra", "Obudu", "Odukpani", "Ogoja", "Yakuur", "Yala"] },
  { name: "Delta", lg: ["Aniocha North", "Aniocha South", "Bomadi", "Burutu", "Ethiope East", "Ethiope West", "Ika North East", "Ika South", "Isoko North", "Isoko South", "Ndokwa East", "Ndokwa West", "Okpe", "Oshimili North", "Oshimili South", "Patani", "Sapele", "Udu", "Ughelli North", "Ughelli South", "Ukwuani", "Uvwie", "Warri North", "Warri South", "Warri South West"] },
  { name: "Ebonyi", lg: ["Abakaliki", "Afikpo North", "Afikpo South", "Ebonyi", "Ezza North", "Ezza South", "Ikwo", "Ishielu", "Ivo", "Izzi", "Ohaozara", "Ohaukwu", "Onicha"] },
  { name: "Edo", lg: ["Akoko-Edo", "Egor", "Esan Central", "Esan North-East", "Esan South-East", "Esan West", "Etsako Central", "Etsako East", "Etsako West", "Igueben", "Ikpoba-Okha", "Orhionmwon", "Oredo", "Ovia North-East", "Ovia South-West", "Owan East", "Owan West", "Uhunmwonde"] },
  { name: "Ekiti", lg: ["Ado Ekiti", "Efon", "Ekiti East", "Ekiti South-West", "Ekiti West", "Emure", "Gbonyin", "Ido Osi", "Ijero", "Ikere", "Ikole", "Ilejemeje", "Irepodun/Ifelodun", "Ise/Orun", "Moba", "Oye"] },
  { name: "Enugu", lg: ["Aninri", "Awgu", "Enugu East", "Enugu North", "Enugu South", "Ezeagu", "Igbo Etiti", "Igbo Eze North", "Igbo Eze South", "Isi Uzo", "Nkanu East", "Nkanu West", "Nsukka", "Oji River", "Udenu", "Udi", "Uzo-Uwani"] },
  { name: "FCT", lg: ["Abaji", "Abuja Municipal", "Bwari", "Gwagwalada", "Kuje", "Kwali"] },
  { name: "Gombe", lg: ["Akko", "Balanga", "Billiri", "Dukku", "Funakaye", "Gombe", "Kaltungo", "Kwami", "Nafada", "Shongom", "Yamaltu/Deba"] },
  { name: "Imo", lg: ["Aboh Mbaise", "Ahiazu Mbaise", "Ehime Mbano", "Ezinihitte", "Ideato North", "Ideato South", "Ihitte/Uboma", "Ikeduru", "Isiala Mbano", "Isu", "Mbaitoli", "Ngor Okpala", "Njaba", "Nkwerre", "Nwangele", "Obowo", "Oguta", "Ohaji/Egbema", "Okigwe", "Orlu", "Orsu", "Oru East", "Oru West", "Owerri Municipal", "Owerri North", "Owerri West", "Unuimo"] },
  { name: "Jigawa", lg: ["Auyo", "Babura", "Biriniwa", "Birnin Kudu", "Buji", "Dutse", "Gagarawa", "Garki", "Gumel", "Guri", "Gwaram", "Gwiwa", "Hadejia", "Jahun", "Kafin Hausa", "Kazaure", "Kiri Kasama", "Kiyawa", "Kaugama", "Maigatari", "Malam Madori", "Miga", "Ringim", "Roni", "Sule Tankarkar", "Taura", "Yankwashi"] },
  { name: "Kaduna", lg: ["Birnin Gwari", "Chikun", "Giwa", "Igabi", "Ikara", "Jaba", "Jema'a", "Kachia", "Kaduna North", "Kaduna South", "Kagarko", "Kajuru", "Kaura", "Kauru", "Kubau", "Kudan", "Lere", "Makarfi", "Sabon Gari", "Sanga", "Soba", "Zangon Kataf", "Zaria"] },
  { name: "Kano", lg: ["Ajingi", "Albasu", "Bagwai", "Bebeji", "Bichi", "Bunkure", "Dala", "Dambatta", "Dawakin Kudu", "Dawakin Tofa", "Doguwa", "Fagge", "Gabasawa", "Garko", "Garun Mallam", "Gaya", "Gezawa", "Gwale", "Gwarzo", "Kabo", "Kano Municipal", "Karaye", "Kibiya", "Kiru", "Kumbotso", "Kunchi", "Kura", "Madobi", "Makoda", "Minjibir", "Nasarawa", "Rano", "Rimin Gado", "Rogo", "Shanono", "Sumaila", "Takai", "Tarauni", "Tofa", "Tsanyawa", "Tudun Wada", "Ungogo", "Warawa", "Wudil"] },
  { name: "Katsina", lg: ["Bakori", "Batagarawa", "Batsari", "Baure", "Bindawa", "Charanchi", "Dandume", "Danja", "Dan Musa", "Daura", "Dutsi", "Dutsin Ma", "Faskari", "Funtua", "Ingawa", "Jibia", "Kafur", "Kaita", "Kankara", "Kankia", "Katsina", "Kurfi", "Kusada", "Mai'Adua", "Malumfashi", "Mani", "Mashi", "Matazu", "Musawa", "Rimi", "Sabuwa", "Safana", "Sandamu", "Zango"] },
  { name: "Kebbi", lg: ["Aleiro", "Arewa Dandi", "Argungu", "Augie", "Bagudo", "Birnin Kebbi", "Bunza", "Danko Wasagu", "Fakai", "Gwandu", "Jega", "Kalgo", "Koko Besse", "Maiyama", "Ngaski", "Sakaba", "Shanga", "Suru", "Wasagu/Danko", "Yauri", "Zuru"] },
  { name: "Kogi", lg: ["Adavi", "Ajaokuta", "Ankpa", "Bassa", "Dekina", "Ibaji", "Idah", "Igalamela Odolu", "Ijumu", "Kabba Bunu", "Kogi", "Lokoja", "Mopa Muro", "Ofu", "Ogori Magongo", "Okehi", "Okene", "Olamaboro", "Omala", "Yagba East", "Yagba West"] },
  { name: "Kwara", lg: ["Asa", "Baruten", "Edu", "Ekiti", "Ifelodun", "Ilorin East", "Ilorin South", "Ilorin West", "Irepodun", "Isin", "Kaiama", "Moro", "Offa", "Oke Ero", "Oyun", "Pategi"] },
  { name: "Lagos", lg: ["Agege", "Ajeromi-Ifelodun", "Alimosho", "Amuwo-Odofin", "Apapa", "Badagry", "Epe", "Eti-Osa", "Ibeju-Lekki", "Ifako-Ijaiye", "Ikeja", "Ikorodu", "Kosofe", "Lagos Island", "Lagos Mainland", "Mushin", "Ojo", "Oshodi-Isolo", "Shomolu", "Surulere"] },
  { name: "Nasarawa", lg: ["Akwanga", "Awe", "Doma", "Karu", "Keana", "Keffi", "Kokona", "Lafia", "Nasarawa", "Nasarawa Egon", "Obi", "Toto", "Wamba"] },
  { name: "Niger", lg: ["Agaie", "Agwara", "Bida", "Borgu", "Bosso", "Chanchaga", "Edati", "Gbako", "Gurara", "Katcha", "Kontagora", "Lapai", "Lavun", "Magama", "Mariga", "Mashegu", "Mokwa", "Moya", "Paikoro", "Rafi", "Rijau", "Shiroro", "Suleja", "Tafa", "Wushishi"] },
  { name: "Ogun", lg: ["Abeokuta North", "Abeokuta South", "Ado-Odo/Ota", "Egbado North", "Egbado South", "Ewekoro", "Ifo", "Ijebu East", "Ijebu North", "Ijebu North East", "Ijebu Ode", "Ikenne", "Imeko Afon", "Ipokia", "Obafemi Owode", "Odeda", "Odogbolu", "Ogun Waterside", "Remo North", "Shagamu"] },
  { name: "Ondo", lg: ["Akoko North-East", "Akoko North-West", "Akoko South-East", "Akoko South-West", "Akure North", "Akure South", "Ese Odo", "Idanre", "Ifedore", "Ilaje", "Ile Oluji/Okeigbo", "Irele", "Odigbo", "Okitipupa", "Ondo East", "Ondo West", "Ose", "Owo"] },
  { name: "Osun", lg: ["Aiyedaade", "Aiyedire", "Atakunmosa East", "Atakunmosa West", "Boluwaduro", "Boripe", "Ede North", "Ede South", "Egbedore", "Ejigbo", "Ife Central", "Ife East", "Ife North", "Ife South", "Ifedayo", "Ifelodun", "Ila", "Ilesa East", "Ilesa West", "Irepodun", "Irewole", "Isokan", "Iwo", "Obokun", "Odo Otin", "Ola Oluwa", "Olorunda", "Oriade", "Orolu", "Osogbo"] },
  { name: "Oyo", lg: ["Afijio", "Akinyele", "Atiba", "Atisbo", "Egbeda", "Ibadan North", "Ibadan North-East", "Ibadan North-West", "Ibadan South-East", "Ibadan South-West", "Ibarapa Central", "Ibarapa East", "Ibarapa North", "Ido", "Irepo", "Iseyin", "Itesiwaju", "Iwajowa", "Kajola", "Lagelu", "Ogbomosho North", "Ogbomosho South", "Ogo Oluwa", "Olorunsogo", "Oluyole", "Ona Ara", "Orelope", "Ori Ire", "Oyo East", "Oyo West", "Saki East", "Saki West", "Surulere"] },
  { name: "Plateau", lg: ["Barkin Ladi", "Bassa", "Bokkos", "Jos East", "Jos North", "Jos South", "Kanam", "Kanke", "Langtang North", "Langtang South", "Mangu", "Mikang", "Pankshin", "Qua'an Pan", "Riyom", "Shendam", "Wase"] },
  { name: "Rivers", lg: ["Abua/Odual", "Ahoada East", "Ahoada West", "Akuku-Toru", "Andoni", "Asari-Toru", "Bonny", "Degema", "Eleme", "Emohua", "Etche", "Gokana", "Ikwerre", "Khana", "Obio/Akpor", "Ogba/Egbema/Ndoni", "Ogu/Bolo", "Okrika", "Omuma", "Opobo/Nkoro", "Oyigbo", "Port Harcourt", "Tai"] },
  { name: "Sokoto", lg: ["Binji", "Bodinga", "Dange Shuni", "Gada", "Goronyo", "Gudu", "Gwadabawa", "Illela", "Isa", "Kebbe", "Kware", "Rabah", "Sabon Birni", "Shagari", "Silame", "Sokoto North", "Sokoto South", "Tambuwal", "Tangaza", "Tureta", "Wamako", "Wurno", "Yabo"] },
  { name: "Taraba", lg: ["Ardo Kola", "Bali", "Donga", "Gashaka", "Gassol", "Ibi", "Jalingo", "Karim Lamido", "Kumi", "Lau", "Sardauna", "Takum", "Ussa", "Wukari", "Yorro", "Zing"] },
  { name: "Yobe", lg: ["Bade", "Bursari", "Damaturu", "Fika", "Fune", "Geidam", "Gujba", "Gulani", "Jakusko", "Karasuwa", "Machina", "Nangere", "Nguru", "Potiskum", "Tarmuwa", "Yunusari", "Yusufari"] },
  { name: "Zamfara", lg: ["Anka", "Bakura", "Birnin Magaji/Kiyaw", "Bukkuyum", "Bungudu", "Gummi", "Gusau", "Kaura Namoda", "Maradun", "Maru", "Shinkafi", "Talata Mafara", "Chafe", "Zurmi"] },
];

export async function GET() {
  try {
    console.log("🌱 Starting database seeding...");

    // Check if prisma is available
    if (!prisma) {
      throw new Error("Prisma client is not initialized");
    }

    // 1. Seed Industries
    console.log("📦 Seeding industries...");
    for (const industry of industries) {
      const existing = await prisma.industry.findUnique({
        where: { id: industry.id },
      });
      
      if (!existing) {
        await prisma.industry.create({
          data: {
            id: industry.id,
            name: industry.name,
            status: true,
          },
        });
        console.log(`  ✅ Created industry: ${industry.name}`);
      } else {
        console.log(`  ⏭️ Industry already exists: ${industry.name}`);
      }
    }

    // 2. Seed Services
    console.log("📦 Seeding services...");
    for (const service of services) {
      const existing = await prisma.service.findFirst({
        where: { 
          name: service.name,
          industryId: service.industryId,
        },
      });
      
      if (!existing) {
        await prisma.service.create({
          data: {
            name: service.name,
            description: service.description,
            industryId: service.industryId,
            status: true,
          },
        });
        console.log(`  ✅ Created service: ${service.name}`);
      } else {
        console.log(`  ⏭️ Service already exists: ${service.name}`);
      }
    }

    // 3. Seed Requirements
    console.log("📦 Seeding requirements...");
    for (const req of requirements) {
      const service = await prisma.service.findFirst({
        where: { name: req.serviceName },
      });

      if (service) {
        const existing = await prisma.requirement.findFirst({
          where: {
            name: req.requirement,
            serviceId: service.id,
          },
        });
        
        if (!existing) {
          await prisma.requirement.create({
            data: {
              name: req.requirement,
              type: req.mandatory ? "MANDATORY" : "OPTIONAL",
              serviceId: service.id,
              status: true,
            },
          });
          console.log(`  ✅ Created requirement: ${req.requirement} for ${req.serviceName}`);
        } else {
          console.log(`  ⏭️ Requirement already exists: ${req.requirement}`);
        }
      } else {
        console.log(`  ⚠️ Service not found for requirement: ${req.serviceName}`);
      }
    }

    // 4. Seed States and Local Governments
    console.log("📦 Seeding states and local governments...");
    for (const stateData of statesWithLGAs) {
      let state = await prisma.state.findUnique({
        where: { name: stateData.name },
      });
      
      if (!state) {
        state = await prisma.state.create({
          data: { name: stateData.name },
        });
        console.log(`  ✅ Created state: ${stateData.name}`);
      } else {
        console.log(`  ⏭️ State already exists: ${stateData.name}`);
      }

      // Seed Local Governments for this state
      for (const lgaName of stateData.lg) {
        const existingLGA = await prisma.localGovernment.findFirst({
          where: {
            name: lgaName,
            stateId: state.id,
          },
        });
        
        if (!existingLGA) {
          await prisma.localGovernment.create({
            data: {
              name: lgaName,
              stateId: state.id,
            },
          });
        }
      }
      console.log(`  ✅ Seeded ${stateData.lg.length} LGAs for ${stateData.name}`);
    }

    const totalLGAs = statesWithLGAs.reduce((acc, state) => acc + state.lg.length, 0);

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully!",
      data: {
        industries: industries.length,
        services: services.length,
        requirements: requirements.length,
        states: statesWithLGAs.length,
        localGovernments: totalLGAs,
      },
    });
  } catch (error) {
    console.error("❌ Seeding error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to seed database",
      },
      { status: 500 }
    );
  }
}