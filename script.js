 // --- CONFIG ---
        const UNSPLASH_KEY = '96dyy3dZ2RYvXAPiVsMwsApTe7aaXRR1ke6JJ-nA9xo';
        const OPENWEATHER_KEY = 'bd56eb2469e8d74303f364fdec32ffed';
        const defaultCities = ["Paris", "London"];

        // Elements
        const $input = document.getElementById('searchInput');
        const $btn = document.getElementById('searchBtn');
        const $photos = document.getElementById('photos');
        const $weather = document.getElementById('weather');
        const $viewerOverlay = document.getElementById('viewerOverlay');
        const $viewerImg = document.getElementById('viewerImg');
        const $closeViewer = document.getElementById('closeViewer');

        // Helpers
        const cap = s => s ? (s[0].toUpperCase() + s.slice(1)) : '';
        const io = new IntersectionObserver((entries) => {
            entries.forEach(en => {
                if (en.isIntersecting) {
                    const img = en.target;
                    img.src = img.dataset.src;
                    io.unobserve(img);
                }
            });
        }, { rootMargin: '120px' });

        // --- PHOTO VIEWER ---
        function showPhoto(url) {
            $viewerImg.src = url;
            $viewerOverlay.style.display = 'flex';
            requestAnimationFrame(() => $viewerOverlay.classList.add('show'));
        }
        function hidePhoto() {
            $viewerOverlay.classList.remove('show');
            setTimeout(() => { $viewerOverlay.style.display = 'none'; $viewerImg.src = ''; }, 350);
        }
        $closeViewer.addEventListener('click', hidePhoto);
        $viewerOverlay.addEventListener('click', e => { if (e.target === $viewerOverlay) hidePhoto(); });
        window.addEventListener('keydown', e => { if (e.key === 'Escape') hidePhoto(); });

        // --- FETCH PHOTOS ---
        async function fetchPhotos(query, container) {
            container.innerHTML = '<div class="muted">Loading photos <span class="loader"></span></div>';
            try {
                const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=12`, {
                    headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` }
                });
                const data = await res.json();
                if (!data.results.length) { container.innerHTML = '<div class="muted">No photos found.</div>'; return; }

                container.innerHTML = '';
                const grid = document.createElement('div');
                grid.style.display = 'grid';
                grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(140px, 1fr))';
                grid.style.gap = '12px';

                data.results.forEach(p => {
                    const a = document.createElement('a');
                    a.href = '#';
                    a.className = 'photo fade-in';
                    a.addEventListener('click', e => { e.preventDefault(); showPhoto(p.urls.full); });

                    const img = document.createElement('img');
                    img.dataset.src = p.urls.regular;
                    img.alt = p.alt_description || query;
                    img.loading = 'lazy';
                    a.appendChild(img);

                    const meta = document.createElement('div');
                    meta.className = 'meta';
                    meta.textContent = p.user.name;
                    a.appendChild(meta);

                    grid.appendChild(a);
                    io.observe(img);
                });

                container.appendChild(grid);
            } catch (err) {
                container.innerHTML = `<div class="muted">Photos error: ${err.message}</div>`;
            }
        }

        // --- FETCH WEATHER ---
        async function fetchWeather(city, container) {
            container.innerHTML = '<div class="muted">Loading weather <span class="loader"></span></div>';
            try {
                const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_KEY}&units=metric`);
                const data = await res.json();
                if (data.cod != 200) { container.innerHTML = `<div class="muted">${data.message}</div>`; return; }

                container.innerHTML = `
            <div class="weather-header">
              <div class="weather-icon"><img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}" style="width:56px;height:56px"></div>
              <div>
                <div class="city">${data.name}, ${data.sys.country}</div>
                <div class="desc">${cap(data.weather[0].description)}</div>
              </div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;gap:12px">
              <div>
                <div class="temp">${Math.round(data.main.temp)}°C</div>
                <div class="small">Feels like ${Math.round(data.main.feels_like)}°C</div>
              </div>
              <div style="text-align:right">
                <div class="small">💧 ${data.main.humidity}%</div>
                <div class="small">💨 ${data.wind.speed} m/s</div>
              </div>
            </div>
        `;
            } catch (err) {
                container.innerHTML = `<div class="muted">Weather error: ${err.message}</div>`;
            }
        }

        // --- PAGE LOAD: SHOW DEFAULT CITIES ---
        function loadDefaultCities() {
            $photos.innerHTML = '';
            $weather.innerHTML = '';
            defaultCities.forEach(city => {
                const photoCard = document.createElement('section');
                photoCard.className = 'card fade-in';
                photoCard.innerHTML = `<h2 style="margin:0 0 12px">${city} Photos</h2><div class="photo-container"></div>`;
                $photos.appendChild(photoCard);
                fetchPhotos(city, photoCard.querySelector('.photo-container'));

                const weatherCard = document.createElement('aside');
                weatherCard.className = 'card fade-in';
                weatherCard.innerHTML = `<h2 style="margin:0 0 12px">${city} Weather</h2><div class="weather-container"></div>`;
                $weather.appendChild(weatherCard);
                fetchWeather(city, weatherCard.querySelector('.weather-container'));
            });
        }

        // --- SEARCH FUNCTION ---
        function doSearch() {
            const q = $input.value.trim();
            if (!q) {
                loadDefaultCities();
                return;
            }

            $photos.innerHTML = '';
            $weather.innerHTML = '';

            const photoCard = document.createElement('section');
            photoCard.className = 'card fade-in';
            photoCard.innerHTML = `<h2 style="margin:0 0 12px">${q} Photos</h2><div class="photo-container"></div>`;
            $photos.appendChild(photoCard);
            fetchPhotos(q, photoCard.querySelector('.photo-container'));

            const weatherCard = document.createElement('aside');
            weatherCard.className = 'card fade-in';
            weatherCard.innerHTML = `<h2 style="margin:0 0 12px">${q} Weather</h2><div class="weather-container"></div>`;
            $weather.appendChild(weatherCard);
            fetchWeather(q, weatherCard.querySelector('.weather-container'));
        }

        // Event listeners
        $btn.addEventListener('click', doSearch);
        $input.addEventListener('keyup', e => { if (e.key === 'Enter') doSearch(); });

        // Initialize
        loadDefaultCities();