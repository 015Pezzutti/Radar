// URL da API do OpenSky Network para obter dados de voos em tempo real
const apiUrl = 'https://opensky-network.org/api/states/all';

// Função para buscar dados de voos em tempo real
async function getRealTimeFlights(map) {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Erro: ${response.status}`);
        }
        const data = await response.json();
        visualizeFlightsOnMap(data.states, map);
    } catch (error) {
        console.error('Erro ao buscar dados de voos:', error);
    }
}

// Função para visualizar os voos no mapa
function visualizeFlightsOnMap(flights, map) {
    // Limpa os marcadores anteriores
    map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    flights.forEach(flight => {
        const [icao24, callsign, originCountry, timePosition, lastContact, longitude, latitude, baroAltitude, onGround] = flight;
        if (latitude && longitude) {
            const marker = L.marker([latitude, longitude]).addTo(map);
            marker.bindPopup(`Voo: ${callsign || 'Desconhecido'}<br>País de Origem: ${originCountry}<br>Altitude: ${baroAltitude ? `${(baroAltitude / 3.281).toFixed(2)} m` : 'Desconhecida'}`);
            marker.on('click', () => showFlightDetails(callsign, originCountry, baroAltitude));
        }
    });
}

// Função para mostrar detalhes do voo na sidebar
function showFlightDetails(callsign, originCountry, baroAltitude) {
    const flightDetailsDiv = document.getElementById('flight-details');
    flightDetailsDiv.innerHTML = `
        <p><strong>Voo:</strong> ${callsign || 'Desconhecido'}</p>
        <p><strong>País de Origem:</strong> ${originCountry}</p>
        <p><strong>Altitude:</strong> ${baroAltitude ? `${(baroAltitude / 3.281).toFixed(2)} m` : 'Desconhecida'}</p>
    `;
}

// Inicializa o mapa
document.addEventListener('DOMContentLoaded', () => {
    const map = L.map('map').setView([20.0, 0.0], 2); // Centralizado próximo à linha do Equador
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Carrega os dados de voos em tempo real e atualiza o mapa
    getRealTimeFlights(map);
    setInterval(() => getRealTimeFlights(map), 60); // Atualiza a cada 60 segundos
});
