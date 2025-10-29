document.addEventListener("DOMContentLoaded", () => {
  loadActivities();

  const signupForm = document.getElementById("signup-form");
  signupForm.addEventListener("submit", handleSignup);
});

async function loadActivities() {
  try {
    const response = await fetch("/activities");
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
                  .map((participant) => `<li>${participant}</li>`)
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
