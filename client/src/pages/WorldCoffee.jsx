import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "../assets/css/country.css";
import "leaflet/dist/leaflet.css";
import Navbar from "../components/Navbar";

function Home() {
  const mapRef = useRef(null); // Use ref to track map instance
  const mapContainerRef = useRef(null); // Ref for the map container (div#map)
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [showSearch, setShowSearch] = useState(true); // state สำหรับควบคุมการแสดง search-container
  const [coffeeData, setCoffeeData] = useState({
    // ... (ข้อมูล coffeeData ตามเดิม)
    Afghanistan: {
      description:
        "ไม่ได้เป็นผู้ผลิตกาแฟสำคัญ แต่มีวัฒนธรรมการดื่มชาและเครื่องดื่มที่เกี่ยวข้องมากกว่า",
      cultivation: "ไม่มีการเพาะปลูกกาแฟในระดับการค้า",
      specialties: [],
    },
    Angola: {
      description:
        "เคยเป็นผู้ผลิตกาแฟรายใหญ่ในทวีปแอฟริกา โดยเฉพาะกาแฟโรบัสต้า",
      cultivation: "ปลูกในภูมิภาคทางเหนือและตอนกลางของประเทศ",
      specialties: ["Angolan Robusta Coffee"],
    },
    Argentina: {
      description:
        "ไม่ใช่ประเทศที่ปลูกกาแฟ แต่เป็นผู้บริโภคกาแฟที่สำคัญในภูมิภาค",
      cultivation: "ไม่มีพื้นที่ปลูกกาแฟในระดับการค้า",
      specialties: ["Café con leche (กาแฟนม)"],
    },
    Australia: {
      description:
        "เริ่มมีการเพาะปลูกกาแฟเพิ่มขึ้นในช่วงไม่กี่ปีที่ผ่านมา โดยเฉพาะกาแฟอาราบิก้า",
      cultivation: "ปลูกในควีนส์แลนด์และนิวเซาท์เวลส์",
      specialties: ["Australian Arabica Coffee"],
    },
    Burundi: {
      description:
        "เป็นหนึ่งในผู้ผลิตกาแฟสำคัญของแอฟริกาตะวันออก มีรสชาติเปรี้ยวและซับซ้อน",
      cultivation: "ปลูกในพื้นที่สูง เช่น Kayanza และ Ngozi",
      specialties: ["Burundian Specialty Coffee"],
    },
    Cameroon: {
      description:
        "ปลูกกาแฟทั้งอาราบิก้าและโรบัสต้า โดยมีกาแฟอาราบิก้าคุณภาพสูงจากภูเขา",
      cultivation: "พื้นที่เพาะปลูกหลักอยู่ในภูมิภาคทางตะวันตก",
      specialties: ["Cameroonian Arabica Coffee"],
    },
    China: {
      description: "การปลูกกาแฟกำลังเติบโต โดยเฉพาะในมณฑลยูนนาน",
      cultivation:
        "พื้นที่หลักอยู่ในมณฑลยูนนาน และปลูกกาแฟอาราบิก้าเป็นส่วนใหญ่",
      specialties: ["Yunnan Arabica Coffee"],
    },
    Congo: {
      description:
        "กาแฟจากคองโกมีคุณภาพสูง โดยเฉพาะกาแฟอาราบิก้าจากภูมิภาค Kivu",
      cultivation: "ปลูกในพื้นที่ทางตะวันออกและใต้ของประเทศ",
      specialties: ["Congo Kivu Coffee"],
    },
    Guatemala: {
      description: "กาแฟกัวเตมาลามีความเป็นกรดและมีกลิ่นหอมซับซ้อน",
      cultivation: "ปลูกในพื้นที่ภูเขา เช่น Antigua และ Huehuetenango",
      specialties: ["Guatemalan Antigua Coffee"],
    },
    India: {
      description:
        "อินเดียผลิตกาแฟทั้งอาราบิก้าและโรบัสต้า โดยมักใช้ในกาแฟเอสเปรสโซ",
      cultivation: "พื้นที่เพาะปลูกหลักอยู่ในรัฐคาร์นาทากา, เคราลา และทมิฬนาฑู",
      specialties: ["Monsooned Malabar Coffee"],
    },
    Indonesia: {
      description:
        "อินโดนีเซียผลิตกาแฟที่หลากหลาย รวมถึงกาแฟจากเกาะบาหลี, สุมาตรา และสุลาเวสี",
      cultivation: "ปลูกในหลายภูมิภาค เช่น สุมาตราและชวา",
      specialties: ["Kopi Luwak (กาแฟขี้ชะมด)", "Sumatra Mandheling Coffee"],
    },
    Jamaica: {
      description:
        "ขึ้นชื่อเรื่องกาแฟบลูเมาน์เทนซึ่งเป็นหนึ่งในกาแฟที่มีราคาแพงที่สุดในโลก",
      cultivation: "ปลูกในพื้นที่ Blue Mountains",
      specialties: ["Jamaica Blue Mountain Coffee"],
    },
    Kenya: {
      description: "กาแฟเคนยามีชื่อเสียงในเรื่องรสชาติที่สดใสและซับซ้อน",
      cultivation: "ปลูกในพื้นที่สูง เช่น Mount Kenya",
      specialties: ["Kenyan AA Coffee"],
    },
    Peru: {
      description: "ผลิตกาแฟออร์แกนิกคุณภาพสูง รสชาติหลากหลาย",
      cultivation: "ปลูกในเขต Amazon และ Andean",
      specialties: ["Peruvian Organic Coffee"],
    },
    Rwanda: {
      description: "กาแฟรวันดามีรสชาติที่ซับซ้อนและมีกลิ่นผลไม้",
      cultivation: "ปลูกในพื้นที่สูง เช่น Lake Kivu",
      specialties: ["Rwandan Bourbon Coffee"],
    },
    Thailand: {
      description: "ประเทศไทยปลูกกาแฟอาราบิก้าในพื้นที่สูงและโรบัสต้าในภาคใต้",
      cultivation: "พื้นที่หลักอยู่ในภาคเหนือ เช่น เชียงราย และเชียงใหม่",
      specialties: ["กาแฟดอยช้าง", "กาแฟดอยตุง"],
    },
    Uganda: {
      description: "เป็นผู้ผลิตกาแฟโรบัสต้ารายใหญ่ที่สุดในแอฟริกา",
      cultivation: "ปลูกในพื้นที่สูง เช่น Mount Elgon",
      specialties: ["Ugandan Bugisu Coffee"],
    },
    Yemen: {
      description:
        "กาแฟเยเมนเป็นกาแฟอาราบิก้าคุณภาพสูงที่ปลูกในพื้นที่ทะเลทราย",
      cultivation: "ปลูกในพื้นที่สูง เช่น Mocha",
      specialties: ["Yemeni Mocha Coffee"],
    },
    Honduras: {
      description: "เป็นผู้ผลิตกาแฟรายใหญ่ในอเมริกากลาง มีคุณภาพหลากหลาย",
      cultivation: "ปลูกในพื้นที่สูง เช่น Copán และ Lempira",
      specialties: ["Honduran SHG Coffee"],
    },
    Mexico: {
      description: "กาแฟเม็กซิโกมีรสชาติหลากหลายและมักปลูกแบบออร์แกนิก",
      cultivation: "ปลูกในภูมิภาคเชียปัส และเวราครูซ",
      specialties: ["Mexican Chiapas Coffee"],
    },
    Tanzania: {
      description: "กาแฟแทนซาเนียมีรสชาติสดใส มักมีกลิ่นผลไม้และไวน์",
      cultivation: "ปลูกในพื้นที่ Mount Kilimanjaro และ Mbeya",
      specialties: ["Tanzanian Peaberry Coffee"],
    },
    IvoryCoast: {
      description: "เป็นหนึ่งในผู้ผลิตกาแฟโรบัสต้ารายใหญ่ในแอฟริกา",
      cultivation: "ปลูกในพื้นที่ทางใต้ของประเทศ",
      specialties: ["Ivorian Robusta Coffee"],
    },
    Laos: {
      description: "ปลูกกาแฟในระดับที่กำลังเติบโต โดยเฉพาะในพื้นที่สูง",
      cultivation: "พื้นที่เพาะปลูกหลักอยู่ใน Bolaven Plateau",
      specialties: ["Lao Arabica Coffee"],
    },
    Philippines: {
      description: "ปลูกกาแฟทั้งอาราบิก้า, โรบัสต้า, เอ็กเซลซ่า และลิเบอริก้า",
      cultivation: "ปลูกในภูมิภาค Batangas และ Cordillera",
      specialties: ["Kape Barako"],
    },
    PapuaNewGuinea: {
      description: "กาแฟปาปัวนิวกินีมีรสชาติซับซ้อนและกลิ่นหอมที่โดดเด่น",
      cultivation: "ปลูกในพื้นที่สูง เช่น Western Highlands",
      specialties: ["Papua New Guinea Coffee"],
    },
    Brazil: {
      description: "เป็นผู้ผลิตกาแฟรายใหญ่ที่สุดในโลก โดยเฉพาะกาแฟอาราบิก้า",
      cultivation: "ปลูกในภูมิภาคทางใต้ เช่น Minas Gerais และ São Paulo",
      specialties: ["Brazilian Santos Coffee"],
    },
    Ethiopia: {
      description: "แหล่งกำเนิดของกาแฟและมีความหลากหลายทางพันธุกรรมสูง",
      cultivation: "ปลูกในพื้นที่สูง เช่น Sidama และ Yirgacheffe",
      specialties: ["Ethiopian Yirgacheffe Coffee"],
    },
    Vietnam: {
      description: "ผู้ผลิตกาแฟโรบัสต้ารายใหญ่ที่สุดในโลก",
      cultivation: "ปลูกในพื้นที่ตอนกลาง เช่น Central Highlands",
      specialties: ["Vietnamese Egg Coffee", "Cà phê sữa đá"],
    },
    Colombia: {
      description:
        "กาแฟโคลอมเบียเป็นที่รู้จักในเรื่องความหอมและความเป็นกรดอ่อน",
      cultivation: "ปลูกในพื้นที่สูง เช่น Antioquia และ Caldas",
      specialties: ["Colombian Supremo Coffee"],
    },
    CostaRica: {
      description: "กาแฟคอสตาริก้ามีคุณภาพสูงและเน้นการผลิตอาราบิก้า",
      cultivation: "ปลูกในภูมิภาค Central Valley และ Tarrazú",
      specialties: ["Costa Rican Tarrazú Coffee"],
    },
    Myanmar: {
      description: "กาแฟพม่ากำลังได้รับความนิยมในตลาดกาแฟพิเศษ",
      cultivation: "ปลูกในภูมิภาค Shan State",
      specialties: ["Myanmar Specialty Coffee"],
    },
    Turkey: {
      description: "เป็นที่รู้จักในเรื่องกาแฟตุรกีแบบดั้งเดิม",
      cultivation: "ไม่ได้ปลูกกาแฟ แต่มีวัฒนธรรมการบริโภคกาแฟที่แข็งแรง",
      specialties: ["Turkish Coffee"],
    },
    Madagascar: {
      description: "ปลูกกาแฟในระดับเล็กน้อย โดยส่วนใหญ่เป็นโรบัสต้า",
      cultivation: "ปลูกในพื้นที่ทางเหนือและตะวันออก",
      specialties: ["Madagascar Robusta Coffee"],
    },
    Nepal: {
      description: "กาแฟเนปาลกำลังเติบโตในตลาดพิเศษ โดยเน้นคุณภาพสูง",
      cultivation: "ปลูกในพื้นที่สูง เช่น Nuwakot และ Gulmi",
      specialties: ["Nepalese Specialty Coffee"],
    },
    Zimbabwe: {
      description: "กาแฟซิมบับเวมีรสชาติที่สดใสและสมดุล",
      cultivation: "ปลูกในพื้นที่ Eastern Highlands",
      specialties: ["Zimbabwean Arabica Coffee"],
    },
    SouthKorea: {
      description:
        "ไม่มีการปลูกกาแฟ แต่มีวัฒนธรรมการบริโภคกาแฟที่เติบโตอย่างรวดเร็ว",
      cultivation: "ไม่มีการเพาะปลูกกาแฟ",
      specialties: ["Korean Dalgona Coffee"],
    },
    SaudiArabia: {
      description: "ไม่มีการปลูกกาแฟ แต่มีวัฒนธรรมกาแฟแบบดั้งเดิม",
      cultivation: "ไม่มีการเพาะปลูกกาแฟ",
      specialties: ["Saudi Arabian Qahwa"],
    },

    // เพิ่มประเทศใหม่
    DominicanRepublic: {
      description:
        "ประเทศโดมินิกันเป็นอีกหนึ่งประเทศในภูมิภาคคาริบเบียนที่มีการผลิตกาแฟในระดับน้อย แต่มีรสชาติที่เป็นเอกลักษณ์",
      cultivation: "ปลูกกาแฟในภูมิภาคสูง เช่น Cordillera Central",
      specialties: ["Dominican Coffee"],
    },
    Panama: {
      description:
        "ประเทศปานามามีชื่อเสียงในเรื่องกาแฟ Geisha ที่ได้รับรางวัลมากมาย",
      cultivation: "ปลูกในพื้นที่สูง เช่น Boquete",
      specialties: ["Panama Geisha Coffee"],
    },
    ElSalvador: {
      description: "เป็นหนึ่งในประเทศในอเมริกากลางที่มีการผลิตกาแฟคุณภาพสูง",
      cultivation: "ปลูกในภูมิภาคสูง เช่น Apaneca",
      specialties: ["El Salvador Pacamara Coffee"],
    },
    Nicaragua: {
      description:
        "กาแฟนิการากามีรสชาติที่กลมกล่อมและเป็นที่นิยมในตลาดกาแฟพิเศษ",
      cultivation: "ปลูกในพื้นที่สูง เช่น Matagalpa",
      specialties: ["Nicaraguan Coffee"],
    },
    Bolivia: {
      description:
        "กาแฟโบลิเวียนมีความหลากหลายทางรสชาติและมีการผลิตในระดับชุมชน",
      cultivation: "ปลูกในพื้นที่สูงในภูมิภาค Andes",
      specialties: ["Bolivian Organic Coffee"],
    },
    Ecuador: {
      description:
        "กาแฟเอกวาดอร์เป็นผลิตภัณฑ์ที่มีความเป็นเอกลักษณ์ในภูมิภาคอเมริกาใต้",
      cultivation: "ปลูกในพื้นที่สูงในภูมิภาค Andes",
      specialties: ["Ecuadorian Arabica Coffee"],
    },
    Venezuela: {
      description:
        "กาแฟเวเนซุเอลามีรสชาติที่นุ่มนวลและมีความเป็นเอกลักษณ์ แต่ปริมาณการผลิตลดลงในปัจจุบัน",
      cultivation: "ปลูกในพื้นที่สูง เช่น Andes ของเวเนซุเอลา",
      specialties: ["Venezuelan Coffee"],
    },
    USA: {
      description:
        "แม้ไม่เป็นประเทศผู้ผลิตกาแฟหลัก แต่สหรัฐอเมริกามีการเพาะปลูกกาแฟในบางพื้นที่ เช่น ฮาวาย",
      cultivation: "ปลูกในฮาวายและบางส่วนของแคลิฟอร์เนีย",
      specialties: ["Hawaiian Kona Coffee"],
    },
    Italy: {
      description:
        "ประเทศอิตาลีเป็นที่รู้จักในวัฒนธรรมการชงกาแฟ โดยเฉพาะเอสเปรสโซและคาปูชิโน",
      cultivation: "ไม่ได้ปลูกกาแฟในระดับการค้า",
      specialties: ["Italian Espresso"],
    },
    France: {
      description:
        "ฝรั่งเศสมีวัฒนธรรมการดื่มกาแฟที่โดดเด่น โดยเฉพาะในร้านกาแฟริมถนน",
      cultivation: "ไม่ได้ปลูกกาแฟในระดับการค้า",
      specialties: ["French Press Coffee"],
    },
    NewZealand: {
      description:
        "นิวซีแลนด์มีวัฒนธรรมการชงกาแฟที่เติบโตขึ้น โดยเฉพาะในเมืองใหญ่",
      cultivation: "ไม่ได้ปลูกกาแฟ แต่มีการนำเข้ากาแฟคุณภาพสูง",
      specialties: ["Flat White (ต้นกำเนิดจากออสเตรเลียและนิวซีแลนด์)"],
    },
  });

  function normalizeCountryName(name) {
    if (!name) return "";                    
    return name
      .toString()
      .normalize("NFKD")                     
      .replace(/[\u0300-\u036f]/g, "")       
      .replace(/&/g, "and")
      .replace(/[^A-Za-z]/g, "")           
      .toLowerCase();
  }

  const COUNTRY_ALIASES = {
    // ตัวอย่างชื่อจาก GeoJSON -> key ใน coffeeData (แบบ normalize แล้ว)
    "cotedivoire": "ivorycoast",
    "laopeoplesdemocraticrepublic": "laos",
    "unitedstatesofamerica": "usa",
    "viet nam": "vietnam", // กันกรณีบางชุดข้อมูล
    "korearepublicof": "southkorea",
    "tanzani­aunitedrepublicof": "tanzania", // กัน whitespace แปลก ๆ
    "tanzaniaunitedrepublicof": "tanzania",
    "bolivarianrepublicofvenezuela": "venezuela",
    "democraticrepublicofthecongo": "congo", // คุณมี "Congo" เดียว
    "republicofthecongo": "congo",
    "russianfederation": "russia", // (ถ้าไม่มี russia ก็ไม่ match)
    "czechia": "czechrepublic",    // เผื่อจะเพิ่มข้อมูลภายหลัง
  };

  const coffeeIndex = {};
  Object.keys(coffeeData).forEach((k) => {
    coffeeIndex[normalizeCountryName(k)] = coffeeData[k];
  });

  // useEffect สำหรับจัดการแผนที่และ GeoJSON
  useEffect(() => {
    if (mapRef.current !== null) return; // Prevent re-initializing the map

    const map = L.map(mapContainerRef.current, {
      attributionControl: false,
    }).setView([20, 0], 2);
    mapRef.current = map;

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      {
        // attribution: '', // หากไม่ต้องการให้มีเลย
        maxZoom: 19,
      }
    ).addTo(map);

    let currentLayer = null; // Store the currently clicked country layer
    let geojson = null; // Store the GeoJSON data for search functionality

    function highlightFeature(e) {
      const layer = e.target;

      // Reset color of previously clicked country (if any)
      if (currentLayer) {
        currentLayer.setStyle({
          weight: 2,
          color: "white",
          dashArray: "3",
          fillOpacity: 0.5,
          fillColor: "#5B4C3B", // Default color when not selected
        });
      }

      // Change color of clicked country
      layer.setStyle({
        weight: 3,
        color: "#ffffff",
        dashArray: "",
        fillOpacity: 0.7,
        fillColor: "#140a01", // Color when selected
      });

      if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
      }

      const rawName = layer?.feature?.properties?.ADMIN || "";
      const key = normalizeCountryName(rawName);
      const aliasKey = COUNTRY_ALIASES[key] || key;
      const info = coffeeIndex[aliasKey];

      const infoEl = document.getElementById("info");
      if (!infoEl) return; // กัน element หาย

      if (info) {
        infoEl.innerHTML = `
          <div class="p-6 bg-[#5c4033] border border-[#d2b48c] rounded-lg shadow-lg">
            <h2 class="text-2xl font-bold text-[#f5f5dc] mb-4">${rawName}</h2>

            <!-- Card container -->
            <div class="flex flex-wrap gap-4 justify-start">
              <!-- ข้อมูลเพิ่มเติม -->
              <div class="bg-[#6b4226] p-4 rounded-md shadow-md border border-[#d2b48c] w-full sm:w-full md:w-[calc(33.333%-16px)]">
                <div class="flex items-center text-base text-[#f5f5dc] mb-2">
                  <img src="/world/info.png" alt="info icon" class="w-6 h-6 mr-3" />
                  <b class="mr-2">ข้อมูลเพิ่มเติม:</b>
                </div>
                <p class="text-[#f5f5dc]">${info.description}</p>
              </div>

              <!-- ภูมิภาคที่ปลูกกาแฟ -->
              <div class="bg-[#6b4226] p-4 rounded-md shadow-md border border-[#d2b48c] w-full sm:w-full md:w-[calc(33.333%-16px)]">
                <div class="flex items-center text-base text-[#f5f5dc] mb-2">
                  <img src="/world/map.png" alt="map icon" class="w-6 h-6 mr-3" />
                  <b class="mr-2">ภูมิภาคที่ปลูกกาแฟ:</b>
                </div>
                <p class="text-[#f5f5dc]">${info.cultivation}</p>
              </div>

              <!-- กาแฟที่มีความโดดเด่น -->
              <div class="bg-[#6b4226] p-4 rounded-md shadow-md border border-[#d2b48c] w-full sm:w-full md:w-[calc(33.333%-16px)]">
                <div class="flex items-center text-base text-[#f5f5dc] mb-2">
                  <img src="/world/bean.png" alt="bean icon" class="w-6 h-6 mr-3" />
                  <b class="mr-2">กาแฟที่มีความโดดเด่น:</b>
                </div>
                <p class="text-[#f5f5dc]">${(info.specialties || []).join(", ")}</p>
              </div>
            </div>
          </div>
        `;
      } else {
        infoEl.innerHTML = `
          <div class="p-6 bg-[#5c4033] border border-[#d2b48c] rounded-lg shadow-lg">
            <h2 class="text-2xl font-bold text-[#f5f5dc] mb-4">${rawName}</h2>

            <!-- Card container -->
            <div class="flex flex-wrap gap-4 justify-start">
              <!-- ข้อมูลเพิ่มเติม -->
              <div class="bg-[#6b4226] p-4 rounded-md shadow-md border border-[#d2b48c] w-full sm:w-full md:w-[calc(33.333%-16px)]">
                <div class="flex items-center text-base text-[#f5f5dc] mb-2">
                  <img src="/world/info.png" alt="info icon" class="w-6 h-6 mr-3" />
                  <b class="mr-2">ข้อมูลเพิ่มเติม:</b>
                </div>
                <p class="text-[#f5f5dc]"> - </p>
              </div>

              <!-- ภูมิภาคที่ปลูกกาแฟ -->
              <div class="bg-[#6b4226] p-4 rounded-md shadow-md border border-[#d2b48c] w-full sm:w-full md:w-[calc(33.333%-16px)]">
                <div class="flex items-center text-base text-[#f5f5dc] mb-2">
                  <img src="/world/map.png" alt="map icon" class="w-6 h-6 mr-3" />
                  <b class="mr-2">ภูมิภาคที่ปลูกกาแฟ:</b>
                </div>
                <p class="text-[#f5f5dc]"> - </p>
              </div>

              <!-- กาแฟที่มีความโดดเด่น -->
              <div class="bg-[#6b4226] p-4 rounded-md shadow-md border border-[#d2b48c] w-full sm:w-full md:w-[calc(33.333%-16px)]">
                <div class="flex items-center text-base text-[#f5f5dc] mb-2">
                  <img src="/world/bean.png" alt="bean icon" class="w-6 h-6 mr-3" />
                  <b class="mr-2">กาแฟที่มีความโดดเด่น:</b>
                </div>
                <p class="text-[#f5f5dc]"> - </p>
              </div>
            </div>
          </div>
        `;
      }

      currentLayer = layer;
    }

    function onEachFeature(feature, layer) {
      layer.on({
        click: highlightFeature, // When country is clicked
      });
    }
    if (!mapContainerRef.current) return; // กัน container ยังไม่ขึ้น
    // Load GeoJSON data for country boundaries
    fetch(
      "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson"
    )
      .then((response) => response.json())
      .then((data) => {
        map.whenReady(() => {
          try {
            if (!map.getPane("overlayPane")) {
              map.createPane("overlayPane");
            }
            const svgRenderer = L.svg();
            geojson = L.geoJson(data, {
              style: {
                fillColor: "#5B4C3B", // Default country color
                weight: 2,
                opacity: 1,
                color: "white",
                dashArray: "3",
                fillOpacity: 0.5,
              },
              onEachFeature,
               renderer: svgRenderer,
            });
            geojson.addTo(map);
          } catch (err) {
            console.error("Error adding GeoJSON to map:", err);
          }
        });
      })
      .catch((err) => {
        console.error("Error loading GeoJSON file:", err);
      });

    // Search country by name
    function searchCountry() {
      if (!geojson) return; // กัน null
      const searchInput = document.getElementById("search-input").value.toLowerCase();
      let found = false;

      geojson.eachLayer(function (layer) {
        const cn = layer.feature?.properties?.ADMIN || "";
        if (cn.toLowerCase() === searchInput) {
          found = true;
          map.fitBounds(layer.getBounds());
          highlightFeature({ target: layer });
        }
      });

      if (!found) alert("Country not found. Please check the name and try again.");
    }

    // Display suggested country names while typing
    function suggestCountries() {
      if (!geojson) return;
      const inputEl = document.getElementById("search-input");
      const suggestionsList = document.getElementById("suggestions");
      if (!inputEl || !suggestionsList) return;
      const searchInput = (inputEl.value || "").toLowerCase();
      suggestionsList.innerHTML = ""; // Clear old suggestions

      if (searchInput === "") {
        suggestionsList.style.display = "none";
        return;
      }

      let suggestions = [];

      geojson.eachLayer(function (layer) {
        const countryName = layer.feature.properties.ADMIN;
        if (countryName.toLowerCase().startsWith(searchInput)) {
          suggestions.push(countryName);
        }
      });

      if (suggestions.length > 0) {
        suggestionsList.style.display = "block";
        suggestions.forEach((country) => {
          const li = document.createElement("li");
          li.textContent = country;
          li.addEventListener("click", () => {
            document.getElementById("search-input").value = country;
            suggestionsList.style.display = "none";
            searchCountry(); // Search immediately when a suggestion is clicked
          });
          suggestionsList.appendChild(li);
        });
      } else {
        suggestionsList.style.display = "none";
      }
    }

    // Add search functionality to the search button
    document
      .getElementById("search-button")
      .addEventListener("click", searchCountry);

    // Add suggestions functionality when typing
    document
      .getElementById("search-input")
      .addEventListener("input", suggestCountries);

    // Cleanup on component unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [coffeeData]); // Run this effect once when the component mounts

  // useEffect สำหรับตรวจจับการ scroll เพื่อควบคุมการแสดง search-container
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY === 0) {
        setShowSearch(true);
      } else {
        setShowSearch(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div>
      <Navbar />
      <div
        ref={mapContainerRef}
        id="map"
        style={{
          height: "500px",
          zIndex: 0, // ทำให้แผนที่อยู่ชั้นล่าง
          position: "relative", // กำหนด position เพื่อรองรับ zIndex
        }}
      ></div>

      <div id="info" className="info-container">
        {selectedCountry ? (
          <></>
        ) : (
          <p>Select a country to see coffee details.</p>
        )}
      </div>

      <div
        id="search-container"
        style={{
          position: "fixed",
          top: showSearch ? "11%" : "-100px",
          transition: "top 0.3s",
        }}
        className="z-0 mt-0  w-20%"
      >
        <input
          type="text"
          id="search-input"
          placeholder="Search for a country..."
        />
        <ul id="suggestions"></ul>
        <button id="search-button">Search</button>
      </div>
    </div>
  );
}

export default Home;
