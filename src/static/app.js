document.addEventListener("DOMContentLoaded", () => {
  loadActivities();

  const signupForm = document.getElementById("signup-form");
  signupForm.addEventListener("submit", handleSignup);
});

async function loadActivities() {
  try {
    // Add cache-busting parameter to prevent browser caching
    const response = await fetch(`/activities?t=${Date.now()}`);
    const activities = await response.json();

    displayActivities(activities);
    populateActivityDropdown(activities);
  } catch (error) {
    console.error("Error loading activities:", error);
    document.getElementById("activities-list").innerHTML =
      '<p class="error">Failed to load activities. Please try again later.</p>';
  }
}

function displayActivities(activities) {
  const activitiesList = document.getElementById("activities-list");

  activitiesList.innerHTML = Object.entries(activities)
    .map(
      ([name, details]) => `
      <div class="activity-card">
        <h4>${name}</h4>
        <p><strong>Description:</strong> ${details.description}</p>
        <p><strong>Schedule:</strong> ${details.schedule}</p>
        <p><strong>Capacity:</strong> ${details.participants.length}/${details.max_participants}</p>
        <div class="participants-section">
          <strong>Current Participants:</strong>
          ${details.participants.length > 0
            ? `<ul class="participants-list">
                ${details.participants
                  .map((participant) => `
                    <li>
                      <span class="participant-email">${participant}</span>
                      <button class="delete-btn" onclick="deleteParticipant('${name}', '${participant}')" title="Remove participant">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </li>
                  `)
                  .join("")}
              </ul>`
            : '<p class="no-participants">No participants yet</p>'}
        </div>
      </div>
    `
    )
    .join("");
}

function populateActivityDropdown(activities) {
  const activitySelect = document.getElementById("activity");

  // Clear existing options except the first placeholder
  while (activitySelect.options.length > 1) {
    activitySelect.remove(1);
  }

  Object.keys(activities).forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    activitySelect.appendChild(option);
  });
}

async function handleSignup(event) {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const activity = document.getElementById("activity").value;
  const messageDiv = document.getElementById("message");

  try {
    const response = await fetch(
      `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(
        email
      )}`,
      {
        method: "POST",
      }
    );

    const data = await response.json();

    if (response.ok) {
      messageDiv.className = "message success";
      messageDiv.textContent = data.message;
      messageDiv.classList.remove("hidden");

      // Reload activities to show updated participant list
      loadActivities();

      // Reset form
      document.getElementById("signup-form").reset();
    } else {
      messageDiv.className = "message error";
      messageDiv.textContent = data.detail || "An error occurred";
      messageDiv.classList.remove("hidden");
    }
  } catch (error) {
    messageDiv.className = "message error";
    messageDiv.textContent = "Failed to sign up. Please try again.";
    messageDiv.classList.remove("hidden");
  }
}

async function deleteParticipant(activityName, email) {
  if (!confirm(`Are you sure you want to unregister ${email} from ${activityName}?`)) {
    return;
  }

  try {
    const response = await fetch(
      `/activities/${encodeURIComponent(activityName)}/unregister?email=${encodeURIComponent(
        email
      )}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    if (response.ok) {
      // Reload activities to show updated participant list
      loadActivities();
    } else {
      alert(data.detail || "Failed to unregister participant");
    }
  } catch (error) {
    console.error("Error unregistering participant:", error);
    alert("Failed to unregister participant. Please try again.");
  }
}
