import { useEffect, useState, useRef } from "react";
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
  const [showSearch, setShowSearch] = useState(true); // state สำหรับควบคุมการแสดง search-container
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

    // การ์ดข้อมูลถิ่นกำเนิด/สายพันธุ์ของประเทศนั้น ๆ
    const ROLE_LABEL = {
      birthplace: { text: "ถิ่นกำเนิดสายพันธุ์", bg: "rgba(245,222,179,0.28)", icon: "\u{1F331}" },
      producer:   { text: "ประเทศผู้ปลูก",      bg: "rgba(255,255,255,0.16)", icon: "\u{1F33E}" },
      consumer:   { text: "วัฒนธรรมการดื่ม",    bg: "rgba(255,255,255,0.12)", icon: "\u2615" },
    };

    const card = (iconEmoji, title, bodyHtml) => `
      <div style="background:rgba(255,255,255,0.08);border:1px solid rgba(210,180,140,0.25);border-radius:0.75rem;padding:1rem;backdrop-filter:blur(4px)">
        <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem">
          <span style="font-size:1rem">${iconEmoji}</span>
          <b style="color:#f5deb3;font-size:0.85rem">${title}</b>
        </div>
        ${bodyHtml}
      </div>`;

    const chips = (arr, strong) =>
      `<div style="display:flex;flex-wrap:wrap;gap:0.4rem;margin-top:0.25rem">${(arr || [])
        .map(
          (x) =>
            `<span style="background:rgba(245,222,179,${strong ? "0.28" : "0.15"});color:#f5deb3;border:1px solid rgba(245,222,179,0.3);border-radius:9999px;padding:0.2rem 0.7rem;font-size:0.76rem">${x}</span>`
        )
        .join("")}</div>`;

    const factRow = (label, value) =>
      `<div style="display:flex;justify-content:space-between;gap:0.75rem;padding:0.3rem 0;border-bottom:1px dashed rgba(245,222,179,0.18)">
         <span style="color:#f5deb3;opacity:.75;font-size:0.78rem">${label}</span>
         <span style="color:#f5f5dc;font-size:0.8rem;text-align:right">${value}</span>
       </div>`;

    function originCards(info) {
      const o = info && info.origin;
      if (!o) return "";
      const isConsumer = o.role === "consumer";
      let html = "";

      // สายพันธุ์ที่ปลูก
      if (!isConsumer && (o.species || []).length) {
        html += card(
          "\u{1F9EC}",
          "สายพันธุ์ที่ปลูก",
          chips(o.species, true) +
            ((o.cultivars || []).length
              ? `<div style="margin-top:0.6rem;color:#f5deb3;opacity:.7;font-size:0.74rem">สายพันธุ์ย่อยเด่น</div>` +
                chips(o.cultivars, false)
              : "")
        );
      }

      // ข้อมูลการเพาะปลูก
      if (!isConsumer) {
        html += card(
          "\u{1F5FB}",
          "ข้อมูลการเพาะปลูก",
          `<div>${factRow("ความสูง", o.altitude || "—")}${factRow("ฤดูเก็บเกี่ยว", o.harvest || "—")}${factRow("การแปรรูป", (o.process || []).join(" · ") || "—")}</div>`
        );
      }

      // โน้ตรสชาติ
      if ((o.flavor || []).length) {
        html += card(isConsumer ? "\u2615" : "\u{1F35E}", isConsumer ? "รสชาติที่นิยม" : "โน้ตรสชาติเด่น", chips(o.flavor, false));
      }

      // เกร็ดถิ่นกำเนิด
      if (o.note) {
        html += card(
          "\u{1F4DC}",
          o.role === "birthplace" ? "เกร็ดถิ่นกำเนิด" : "เกร็ดน่ารู้",
          `<p style="color:#f5f5dc;font-size:0.85rem;line-height:1.6;margin:0">${o.note}</p>`
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
        setSelectedCountry(null);
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

      if (info) {
        infoEl.innerHTML = `
          <div class="wc-panel" data-open="true">
            <button type="button" class="wc-head" aria-expanded="true">
              <span class="wc-globe">🌍</span>
              <h2 class="wc-name">${rawName}</h2>
              ${
                info.origin && ROLE_LABEL[info.origin.role]
                  ? `<span class="wc-role" style="background:${ROLE_LABEL[info.origin.role].bg}">${ROLE_LABEL[info.origin.role].icon} ${ROLE_LABEL[info.origin.role].text}</span>`
                  : ""
              }
              <span class="wc-caret" aria-hidden="true">▾</span>
            </button>
            <button type="button" class="wc-close" aria-label="ปิดข้อมูลประเทศ">✕</button>
            <div class="wc-body">
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem">
              <div style="background:rgba(255,255,255,0.08);border:1px solid rgba(210,180,140,0.25);border-radius:0.75rem;padding:1rem;backdrop-filter:blur(4px)">
                <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem">
                  <img src="/world/info.png" alt="" style="width:20px;height:20px" />
                  <b style="color:#f5deb3;font-size:0.85rem">ข้อมูลเพิ่มเติม</b>
                </div>
                <p style="color:#f5f5dc;font-size:0.875rem;line-height:1.6;margin:0">${info.description}</p>
              </div>
              <div style="background:rgba(255,255,255,0.08);border:1px solid rgba(210,180,140,0.25);border-radius:0.75rem;padding:1rem;backdrop-filter:blur(4px)">
                <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem">
                  <img src="/world/map.png" alt="" style="width:20px;height:20px" />
                  <b style="color:#f5deb3;font-size:0.85rem">ภูมิภาคที่ปลูกกาแฟ</b>
                </div>
                <p style="color:#f5f5dc;font-size:0.875rem;line-height:1.6;margin:0">${info.cultivation}</p>
              </div>
              <div style="background:rgba(255,255,255,0.08);border:1px solid rgba(210,180,140,0.25);border-radius:0.75rem;padding:1rem;backdrop-filter:blur(4px)">
                <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem">
                  <img src="/world/bean.png" alt="" style="width:20px;height:20px" />
                  <b style="color:#f5deb3;font-size:0.85rem">กาแฟที่มีความโดดเด่น</b>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:0.4rem;margin-top:0.25rem">
                  ${(info.specialties || []).map(s => `<span style="background:rgba(245,222,179,0.2);color:#f5deb3;border:1px solid rgba(245,222,179,0.3);border-radius:9999px;padding:0.2rem 0.75rem;font-size:0.78rem">${s}</span>`).join("")}
                </div>
              </div>
              ${originCards(info)}
            </div>
            </div>
          </div>
        `;
      } else {
        infoEl.innerHTML = `
          <div class="wc-panel" data-open="true">
            <button type="button" class="wc-head" aria-expanded="true">
              <span class="wc-globe">🌍</span>
              <h2 class="wc-name">${rawName}</h2>
              <span class="wc-caret" aria-hidden="true">▾</span>
            </button>
            <button type="button" class="wc-close" aria-label="ปิดข้อมูลประเทศ">✕</button>
            <div class="wc-body">
              <p style="color:#f5deb3;opacity:0.7;font-style:italic;margin:0">ยังไม่มีข้อมูลกาแฟสำหรับประเทศนี้ในระบบ</p>
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
      searchBtn?.removeEventListener("click", searchCountry);
      searchInputEl?.removeEventListener("input", suggestCountries);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Run this effect once when the component mounts

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
    <div className="min-h-screen bg-[#f3f1ec]">
      <Navbar />

      {/* Error banner — แผนที่ยังใช้ได้ แต่ข้อมูลกาแฟไม่โหลด */}
      {dataError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          <span>⚠️</span>
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
            className="ml-auto underline font-semibold"
          >
            ลองใหม่
          </button>
        </div>
      )}

      {/* Map */}
      <div
        ref={mapContainerRef}
        id="map"
        style={{ zIndex: 0, position: "relative" }}
      />

      {/* Info panel */}
      <div id="info" className="info-container">
        {!selectedCountry && (
          <div className="flex items-center gap-4 py-6 px-4">
            <span className="text-3xl">🗺️</span>
            <div>
              <p className="font-semibold text-[#5c4033]">คลิกที่ประเทศบนแผนที่เพื่อดูข้อมูลกาแฟ</p>
              <p className="text-sm text-[#5c4033]/60 mt-0.5">มีข้อมูลกาแฟจาก 48 ประเทศทั่วโลก</p>
            </div>
          </div>
        )}
      </div>

      {/* Search container */}
      <div
        id="search-container"
        style={{
          top: showSearch ? undefined : "-140px",
          transition: "top 0.3s ease",
        }}
      >
        <input
          type="text"
          id="search-input"
          placeholder="Search for a country..."
        />
        <ul id="suggestions" />
        <button id="search-button">Search</button>
      </div>
    </div>
  );
}

export default Home;
