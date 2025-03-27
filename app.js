// Heroku Backend URL
const backendUrl = "https://guarded-woodland-37416-faa670fdf5ed.herokuapp.com";

// Fetching Venues Function
async function fetchVenues() {
    try {
        const response = await fetch(`${backendUrl}/venues`);
        const data = await response.json();

        // Ensure compatibility with previous working version
        const venues = data.output ? JSON.parse(data.output).venues : data.venues;

        if (!venues || venues.length === 0) {
            return;
        }

        const venueCardsContainer = document.getElementById('venue-cards');
        venueCardsContainer.innerHTML = ''; // Clear existing content

        venues.forEach((venue) => {
            const venueCard = document.createElement('div');
            venueCard.classList.add('col-md-4', 'mb-4');

            venueCard.innerHTML = `
                <div class="card">
                    <img src="${venue.image_URL}" class="card-img-top" alt="${venue.venue_name}">
                    <div class="card-body">
                        <h5 class="card-title">${venue.venue_name}</h5>
                        <p class="card-text"><strong>Type:</strong> ${venue.type || "N/A"}</p>
                        <p class="card-text"><strong>Price per Hour:</strong> $${venue.price_per_hour}</p>
                        <p class="card-text"><strong>Capacity:</strong> ${venue.capacity}</p>
                        <p class="card-text"><strong>Amenities:</strong> ${venue.amenities}</p>
                        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#bookingModal"
                        onclick="openBookingForm('${venue.venue_name}', ${venue.price_per_hour})">Book Now</button>
                    </div>
                </div>
            `;

            venueCardsContainer.appendChild(venueCard);
        });
    } catch (error) {
        console.error("Error fetching venues:", error);
    }
}

document.addEventListener('DOMContentLoaded', fetchVenues);

// Booking Form Logic
function openBookingForm(venueName, pricePerHour) {
    // Get form elements
    const bookingForm = document.getElementById('booking-form');
    const hoursInput = document.getElementById('bookingHours');
    const totalPriceDisplay = document.getElementById('total-price');
    const venueNameInput = document.getElementById('venueName');

    // Set venue name and reset form values
    venueNameInput.value = venueName;
    document.getElementById('fullName').value = "";
    document.getElementById('emailAddress').value = "";
    document.getElementById('phoneNumber').value = "";
    document.getElementById('bookingDate').value = "";
    hoursInput.value = "";
    totalPriceDisplay.textContent = "0";

    // Update total price when hours change
    hoursInput.addEventListener("input", function () {
        const hours = parseInt(hoursInput.value);
        totalPriceDisplay.textContent = hours > 0 ? (hours * pricePerHour).toFixed(2) : "0";
    });

    // Handle form submission
    bookingForm.onsubmit = async function (event) {
        event.preventDefault();

        const bookingData = {
            venue_name: venueNameInput.value,
            full_name: document.getElementById("fullName").value,
            email_address: document.getElementById("emailAddress").value,
            phone_number: document.getElementById("phoneNumber").value,
            booking_date: document.getElementById("bookingDate").value,
            booking_hours: hoursInput.value,
            total_price: parseFloat(totalPriceDisplay.textContent)
        };

        try {
            const response = await fetch(`${backendUrl}/book_venue`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bookingData),
            });

            const result = await response.json();
            if (response.ok) {
                alert("Booking successful!");
                bookingForm.reset();
                totalPriceDisplay.textContent = "0";
                const bookingModal = bootstrap.Modal.getInstance(document.getElementById("bookingModal"));
                bookingModal.hide();
            } else {
                alert(`Error: ${result.detail || "Booking failed."}`);
            }
        } catch (error) {
            console.error("Error submitting booking:", error);
            alert("An error occurred while booking the venue.");
        }
    };
}

document.addEventListener('DOMContentLoaded', fetchVenues);

function scrollToVenues() {
    const venueCards = document.getElementById("venue-cards");
    if (venueCards) {
        venueCards.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

function filterVenuesByType() {
    const searchQuery = document.getElementById('search-box').value.toLowerCase();
    const venueCards = document.querySelectorAll('#venue-cards .card');

    venueCards.forEach(card => {
        const venueType = card.querySelector('.card-text strong').nextSibling.textContent.trim().toLowerCase();
        if (venueType.startsWith(searchQuery)) {
            card.parentElement.style.display = 'block'; // Show matching cards
        } else {
            card.parentElement.style.display = 'none'; // Hide non-matching cards
        }
    });
}

function clearSearch() {
    document.getElementById('search-box').value = '';
    const venueCards = document.querySelectorAll('#venue-cards .card');
    venueCards.forEach(card => {
        card.parentElement.style.display = 'block'; // Show all cards
    });
}

