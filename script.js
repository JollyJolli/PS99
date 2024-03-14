  document.addEventListener('DOMContentLoaded', function() {
      const searchInput = document.getElementById('searchInput');
      const searchButton = document.getElementById('searchButton');
      const clearSearchInput = document.getElementById('clearSearchInput');
      const petsContainer = document.getElementById('petsContainer');
      const paginationContainer = document.getElementById('paginationContainer');

      let petsData = [];
      let rapData = [];
      let existsData = [];
      const itemsPerPage = 10;
      let currentPage = 1;

    // Mostrar pantalla de carga
    const loadingContainer = document.getElementById('loadingContainer');
    loadingContainer.style.display = 'flex';

      // Cargar los datos de ps.json
      fetch('/ps.json')
          .then(response => response.json())
          .then(jsonData => {
              petsData = jsonData.data;
              displayPets(currentPage);
          })
        .catch((error) => {
          console.error('Error al cargar los datos de ps.json:', error);
        })
        .finally(() => {
          // Ocultar pantalla de carga
          loadingContainer.style.display = 'none';
          contentContainer.style.visibility = 'visible';
          contentContainer.style.opacity = '1';
        });

      // Cargar los datos de RAP
      fetch('/rap.json')
          .then(response => response.json())
          .then(jsonData => {
              rapData = jsonData.data;
          })
          .catch(error => {
              console.error('Error al cargar los datos de RAP:', error);
          });

      // Cargar los datos de EXISTS
      fetch('/exists.json')
          .then(response => response.json())
          .then(jsonData => {
              existsData = jsonData.data;
          })
          .catch(error => {
              console.error('Error al cargar los datos de EXISTS:', error);
          });

      // Función para mostrar las mascotas en la página actual
      function displayPets(page, results = null) {
          const startIndex = (page - 1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          const paginatedPets = results ? results.slice(startIndex, endIndex) : petsData.slice(startIndex, endIndex);
          petsContainer.innerHTML = '';
          paginatedPets.forEach(pet => {
              const card = createPetCard(pet);
              petsContainer.appendChild(card);
          });
          renderPagination();
      }

      // Función para crear una tarjeta de mascota
      function createPetCard(pet) {
          const card = document.createElement('div');
          card.classList.add('card');
          card.innerHTML = `
              <img src="${pet.configData.thumbnail}" alt="${pet.configName}">
              <h2>${pet.configName}</h2>
              <p>${pet.configData.indexDesc}</p>
          `;

          // Obtener el valor correspondiente en RAP
          const rapEntry = rapData.find(entry => entry.configData.id === pet.configName);
          const rapValue = rapEntry ? rapEntry.value : null;

          // Obtener el valor correspondiente en EXISTS
          const existsEntry = existsData.find(entry => entry.configData.id === pet.configName);
          const existsValue = existsEntry ? existsEntry.value : null;

          // Agregar el valor de RAP a la tarjeta
          if (rapValue !== null) {
              const rapValueElement = document.createElement('p');
              rapValueElement.innerHTML = `<i class="fas fa-diamond"></i> RAP: ${numberWithCommas(rapValue)}`;
              card.appendChild(rapValueElement);
          } else {
              const rapValueElement = document.createElement('p');
              rapValueElement.textContent = 'RAP: N/A';
              card.appendChild(rapValueElement);
          }

          // Agregar el valor de EXISTS a la tarjeta
          if (existsValue !== null) {
              const existsValueElement = document.createElement('p');
              existsValueElement.textContent = `Exists: ${existsValue}`;
              card.appendChild(existsValueElement);
          } else {
              const existsValueElement = document.createElement('p');
              existsValueElement.textContent = 'Exists: N/A';
              card.appendChild(existsValueElement);
          }

          return card;
      }

      // Función para renderizar la paginación
      function renderPagination() {
          const totalPages = Math.ceil(petsData.length / itemsPerPage);
          paginationContainer.innerHTML = '';
          for (let i = 1; i <= totalPages; i++) {
              const pageLink = document.createElement('a');
              pageLink.href = '#';
              pageLink.textContent = i;
              pageLink.classList.add('page-link');
              if (i === currentPage) {
                  pageLink.classList.add('active');
              }
              pageLink.addEventListener('click', function(event) {
                  event.preventDefault();
                  currentPage = i;
                  displayPets(currentPage);
              });
              paginationContainer.appendChild(pageLink);
          }
      }

      // Escuchar cambios en el campo de búsqueda
      searchInput.addEventListener('input', function() {
          const query = this.value.trim();
          if (query !== '') {
              const results = petsData.filter(pet => pet.configName.toLowerCase().includes(query.toLowerCase()));
              currentPage = 1; // Resetear la página actual al realizar una nueva búsqueda
              displayPets(currentPage, results);
          } else {
              displayPets(currentPage); // Mostrar todas las mascotas si la búsqueda está vacía
          }
      });

      // Buscar mascotas al hacer clic en el botón de búsqueda
      searchButton.addEventListener('click', function() {
          const query = searchInput.value.trim();
          if (query !== '') {
              const results = petsData.filter(pet => pet.configName.toLowerCase().includes(query.toLowerCase()));
              currentPage = 1; // Resetear la página actual al realizar una nueva búsqueda
              displayPets(currentPage, results);
          } else {
              displayPets(currentPage); 
          }
      });

      // Limpiar el campo de búsqueda
      clearSearchInput.addEventListener('click', function() {
          searchInput.value = '';
          currentPage = 1;
          displayPets(currentPage);
      });

      // Función para agregar comas a los números
      function numberWithCommas(x) {
          return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      }
  });
