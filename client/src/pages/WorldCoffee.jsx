import { useEffect, useState, useRef } from "react";
import { AlertTriangle, Map as MapIcon } from "lucide-react";
import L from "leaflet";
import "../assets/css/country.css";
import "leaflet/dist/leaflet.css";
import Navbar from "../components/Navbar";
import { fetchCountries } from "../api/contentApi";

function Home() {
  const mapRef = useRef(null); // Use ref to track map instance
  const mapContainerRef = useRef(null); // Ref for the map container (div#map)
  const coffeeIndexRef = useRef({}); // stores normalized-key lookup, always up to date
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [dataError, setDataError] = useState(false);

  // Fetch country data and build coffeeIndexRef
  useEffect(() => {
    fetchCountries()
      .then((data) => {
        const idx = {};
        data.forEach((item) => {
          idx[normalizeCountryName(item.key)] = item;
        });
        coffeeIndexRef.current = idx;
      })
      .catch(() => setDataError(true));
  }, []);

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

  // useEffect สำหรับจัดการแผนที่และ GeoJSON
  useEffect(() => {
    if (mapRef.current !== null) return; // Prevent re-initializing the map

    /* คำนวณ minZoom จากความกว้างจริงของกล่องแผนที่ — กันไม่ให้จอกว้างกว่าโลกที่
       zoom นั้น (Leaflet จะเรนเดอร์โลกซ้ำมาเติมพื้นที่ว่างถ้าปล่อยให้ zoom ต่ำเกินไป)
       256px = ความกว้างไทล์ที่ zoom 0 ตามสเปกของ Leaflet/Web Mercator */
    const computeMinZoom = () => {
      const w = mapContainerRef.current?.clientWidth || 1024;
      return Math.max(2, Math.ceil(Math.log2(w / 256)));
    };
    const initialMinZoom = computeMinZoom();

    const map = L.map(mapContainerRef.current, {
      attributionControl: false,
      minZoom: initialMinZoom,
      // ขอบเขตแบบ Web Mercator (±85.0511°) กันแพนเลยขั้วโลกจนภาพบิด
      maxBounds: [[-85.06, -180], [85.06, 180]],
      maxBoundsViscosity: 1.0,
      worldCopyJump: false,
    }).setView([20, 0], initialMinZoom);
    mapRef.current = map;

    // จอถูกปรับขนาด (เช่น หมุนมือถือ/ย่อ-ขยายหน้าต่าง) — คำนวณ minZoom ใหม่กันโลกซ้ำโผล่มาอีก
    const handleResize = () => {
      const nextMinZoom = computeMinZoom();
      map.setMinZoom(nextMinZoom);
      if (map.getZoom() < nextMinZoom) map.setZoom(nextMinZoom);
    };
    window.addEventListener("resize", handleResize);

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      {
        // attribution: '', // หากไม่ต้องการให้มีเลย
        maxZoom: 19,
      }
    ).addTo(map);

    let currentLayer = null; // Store the currently clicked country layer
    let geojson = null; // Store the GeoJSON data for search functionality

    // การ์ดข้อมูลถิ่นกำเนิด/สายพันธุ์ของประเทศนั้น ๆ — ไม่ใช้ emoji แล้ว (ดู feedback_icons)
    const ROLE_LABEL = {
      birthplace: { text: "ถิ่นกำเนิดสายพันธุ์", cls: "wc-role--birthplace" },
      producer:   { text: "ประเทศผู้ปลูก",      cls: "wc-role--producer" },
      consumer:   { text: "วัฒนธรรมการดื่ม",    cls: "wc-role--consumer" },
    };

    // iconSrc เป็น null ได้ — การ์ดข้อมูลถิ่นกำเนิดไม่มีไฟล์ไอคอนเฉพาะ ใช้หัวข้อตัวหนาล้วนแทน
    const card = (iconSrc, title, bodyHtml) => `
      <div class="wc-card">
        <div class="wc-card-head">
          ${iconSrc ? `<img src="${iconSrc}" alt="" class="wc-card-icon" />` : ""}
          <b class="wc-card-title">${title}</b>
        </div>
        ${bodyHtml}
      </div>`;

    const chips = (arr, strong) =>
      `<div class="wc-chip-row">${(arr || [])
        .map((x) => `<span class="wc-chip${strong ? " wc-chip--strong" : ""}">${x}</span>`)
        .join("")}</div>`;

    const factRow = (label, value) =>
      `<div class="wc-fact-row">
         <span class="wc-fact-label">${label}</span>
         <span class="wc-fact-value">${value}</span>
       </div>`;

    function originCards(info) {
      const o = info && info.origin;
      if (!o) return "";
      const isConsumer = o.role === "consumer";
      let html = "";

      // สายพันธุ์ที่ปลูก
      if (!isConsumer && (o.species || []).length) {
        html += card(
          null,
          "สายพันธุ์ที่ปลูก",
          chips(o.species, true) +
            ((o.cultivars || []).length
              ? `<div class="wc-subtitle">สายพันธุ์ย่อยเด่น</div>` + chips(o.cultivars, false)
              : "")
        );
      }

      // ข้อมูลการเพาะปลูก
      if (!isConsumer) {
        html += card(
          null,
          "ข้อมูลการเพาะปลูก",
          `<div>${factRow("ความสูง", o.altitude || "—")}${factRow("ฤดูเก็บเกี่ยว", o.harvest || "—")}${factRow("การแปรรูป", (o.process || []).join(" · ") || "—")}</div>`
        );
      }

      // โน้ตรสชาติ
      if ((o.flavor || []).length) {
        html += card(null, isConsumer ? "รสชาติที่นิยม" : "โน้ตรสชาติเด่น", chips(o.flavor, false));
      }

      // เกร็ดถิ่นกำเนิด
      if (o.note) {
        html += card(
          null,
          o.role === "birthplace" ? "เกร็ดถิ่นกำเนิด" : "เกร็ดน่ารู้",
          `<p class="wc-note">${o.note}</p>`
        );
      }
      return html;
    }

    /* ชุดข้อมูล geo-countries ต้นทางเปลี่ยน property จาก ADMIN -> name
       อ่านหลาย key เผื่อไว้ ไม่ให้แผนที่ตายอีกถ้าต้นทางเปลี่ยนอีกรอบ */
    const featureName = (layer) => {
      const pr = layer?.feature?.properties || {};
      return pr.name || pr.ADMIN || pr.NAME || pr.admin || pr.sovereignt || "";
    };

    /* innerHTML ไม่พา event listener มาด้วย จึงต้องผูกใหม่ทุกครั้งที่เปลี่ยนประเทศ */
    function wirePanel(infoEl) {
      const panel = infoEl.querySelector(".wc-panel");
      if (!panel) return;
      const head = panel.querySelector(".wc-head");
      const closeBtn = panel.querySelector(".wc-close");

      head?.addEventListener("click", () => {
        const open = panel.getAttribute("data-open") !== "false";
        panel.setAttribute("data-open", open ? "false" : "true");
        head.setAttribute("aria-expanded", open ? "false" : "true");
      });

      closeBtn?.addEventListener("click", () => {
        infoEl.innerHTML = "";
        resetHighlight();       // คืนสีประเทศที่เลือกไว้
        currentLayer = null;
        setSelectedCountry(null); // แสดง placeholder กลับมา (ดู JSX: div นี้แยกจาก #info)
      });
    }

    // คืนสีประเทศที่เคยถูกเลือกกลับเป็นค่าเริ่มต้น
    function resetHighlight() {
      if (!currentLayer) return;
      currentLayer.setStyle({
        weight: 2,
        color: "white",
        dashArray: "3",
        fillOpacity: 0.5,
        fillColor: "#5B4C3B",
      });
    }

    function highlightFeature(e) {
      const layer = e.target;

      resetHighlight(); // คืนสีประเทศก่อนหน้า (ถ้ามี)

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

      const rawName = featureName(layer);
      const key = normalizeCountryName(rawName);
      const aliasKey = COUNTRY_ALIASES[key] || key;
      const info = coffeeIndexRef.current[aliasKey];

      const infoEl = document.getElementById("info");
      if (!infoEl) return; // กัน element หาย
      setSelectedCountry(rawName); // ซ่อน placeholder (ดู JSX: div นั้นแยกจาก #info)

      if (info) {
        infoEl.innerHTML = `
          <div class="wc-panel" data-open="true">
            <div class="wc-topbar">
              <button type="button" class="wc-head" aria-expanded="true">
                <div class="wc-titles">
                  <h2 class="wc-name">${rawName}</h2>
                  ${
                    info.origin && ROLE_LABEL[info.origin.role]
                      ? `<span class="wc-role ${ROLE_LABEL[info.origin.role].cls}">${ROLE_LABEL[info.origin.role].text}</span>`
                      : ""
                  }
                </div>
                <span class="wc-caret" aria-hidden="true">▾</span>
              </button>
              <button type="button" class="wc-close" aria-label="ปิดข้อมูลประเทศ">✕</button>
            </div>
            <div class="wc-body">
            <div class="wc-grid">
              ${card("/world/info.png", "ข้อมูลเพิ่มเติม", `<p class="wc-card-text">${info.description}</p>`)}
              ${card("/world/map.png", "ภูมิภาคที่ปลูกกาแฟ", `<p class="wc-card-text">${info.cultivation}</p>`)}
              ${card("/world/bean.png", "กาแฟที่มีความโดดเด่น", chips(info.specialties, false))}
              ${originCards(info)}
            </div>
            </div>
          </div>
        `;
      } else {
        infoEl.innerHTML = `
          <div class="wc-panel" data-open="true">
            <div class="wc-topbar">
              <button type="button" class="wc-head" aria-expanded="true">
                <div class="wc-titles">
                  <h2 class="wc-name">${rawName}</h2>
                </div>
                <span class="wc-caret" aria-hidden="true">▾</span>
              </button>
              <button type="button" class="wc-close" aria-label="ปิดข้อมูลประเทศ">✕</button>
            </div>
            <div class="wc-body">
              <p class="wc-empty">ยังไม่มีข้อมูลกาแฟสำหรับประเทศนี้ในระบบ</p>
            </div>
          </div>
        `;
      }

      wirePanel(infoEl);
      currentLayer = layer;
    }

    function onEachFeature(feature, layer) {
      layer.on({
        click: highlightFeature, // When country is clicked
      });
    }
    if (!mapContainerRef.current) return; // กัน container ยังไม่ขึ้น
    let cancelled = false; // true เมื่อ component unmount แล้ว
    // Load GeoJSON data for country boundaries
    fetch(
      "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson"
    )
      .then((response) => response.json())
      .then((data) => {
        if (cancelled || mapRef.current !== map) return; // แผนที่ถูกทำลายไปแล้ว
        map.whenReady(() => {
          if (cancelled || mapRef.current !== map) return;
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
      const searchEl = document.getElementById("search-input");
      if (!searchEl) return;
      const searchInput = searchEl.value.toLowerCase();
      let found = false;

      geojson.eachLayer(function (layer) {
        const cn = featureName(layer);
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
        const countryName = featureName(layer);
        if (!countryName) return;
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
    const searchBtn = document.getElementById("search-button");
    const searchInputEl = document.getElementById("search-input");
    searchBtn?.addEventListener("click", searchCountry);

    // Add suggestions functionality when typing
    searchInputEl?.addEventListener("input", suggestCountries);

    // Cleanup on component unmount
    return () => {
      cancelled = true;
      window.removeEventListener("resize", handleResize);
      searchBtn?.removeEventListener("click", searchCountry);
      searchInputEl?.removeEventListener("input", suggestCountries);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Run this effect once when the component mounts

  return (
    <div className="min-h-screen bg-[#f3f1ec]">
      <Navbar />

      {/* Error banner — แผนที่ยังใช้ได้ แต่ข้อมูลกาแฟไม่โหลด */}
      {dataError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          <AlertTriangle className="flex-none size-4" strokeWidth={2} />
          <span>โหลดข้อมูลกาแฟไม่สำเร็จ คลิกประเทศจะไม่แสดงข้อมูล</span>
          <button
            onClick={() => {
              setDataError(false);
              fetchCountries()
                .then((data) => {
                  const idx = {};
                  data.forEach((item) => { idx[normalizeCountryName(item.key)] = item; });
                  coffeeIndexRef.current = idx;
                })
                .catch(() => setDataError(true));
            }}
            className="ml-auto underline font-semibold transition-opacity duration-150 hover:opacity-70"
          >
            ลองใหม่
          </button>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 md:px-8 py-5">
        {/* แถบค้นหา — อยู่ในเนื้อหาปกติ ไม่ลอยทับแผนที่แล้ว จึงไม่ชนปุ่ม +/- ของแผนที่ */}
        <div className="mb-4 flex items-center gap-2 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-black/5">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7b4b29]/50">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              id="search-input"
              placeholder="ค้นหาประเทศ เช่น Ethiopia, Brazil..."
              className="w-full rounded-xl border border-black/10 bg-[#faf7f2] py-2.5 pl-10 pr-3 text-sm text-[#2a1c14] outline-none transition-shadow duration-200 focus:border-[#7b4b29]/40 focus:ring-2 focus:ring-[#7b4b29]/15"
            />
            <ul
              id="suggestions"
              className="absolute left-0 right-0 top-full z-[1001] mt-1.5 hidden max-h-48 overflow-y-auto rounded-xl border border-black/10 bg-white py-1 shadow-lg"
            />
          </div>
          <button
            id="search-button"
            className="shrink-0 rounded-xl bg-[#2a1c14] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 ease-smooth hover:bg-[#7b4b29] hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
          >
            ค้นหา
          </button>
        </div>

        {/* แผนที่ + ข้อมูลประเทศ — วางข้างกันบนจอกว้าง ไม่ต้องเลื่อนลงไปอ่าน */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4 items-start">
          <div
            ref={mapContainerRef}
            id="map"
            className="h-[380px] sm:h-[440px] lg:h-[560px] w-full rounded-2xl shadow-md overflow-hidden"
            style={{ zIndex: 0, position: "relative" }}
          />

          <div className="lg:sticky lg:top-20 lg:h-[560px] lg:overflow-y-auto rounded-2xl">
            {/* placeholder เป็น React element แยกต่างหาก เพราะ #info ข้างล่างถูกเขียนทับด้วย innerHTML ตรง ๆ นอกการควบคุมของ React */}
            {!selectedCountry && (
              <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-md ring-1 ring-black/5 animate-fade-in">
                <MapIcon className="size-8 flex-none text-[#7b4b29]/50" strokeWidth={1.5} />
                <div>
                  <p className="font-semibold text-[#5c4033]">คลิกที่ประเทศบนแผนที่เพื่อดูข้อมูลกาแฟ</p>
                  <p className="text-sm text-[#5c4033]/60 mt-0.5">มีข้อมูลกาแฟจาก 48 ประเทศทั่วโลก</p>
                </div>
              </div>
            )}
            <div id="info" className="info-container" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
