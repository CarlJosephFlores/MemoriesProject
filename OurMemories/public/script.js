//const API = "http://192.168.1.10:3000";   // ← Change to your computer's IP when testing on phone
const API = "http://localhost:3000";

function hideAll() {
    document.getElementById("yearsView").classList.add("hidden");
    document.getElementById("galleryView").classList.add("hidden");
    document.getElementById("uploadView").classList.add("hidden");
}

function showUpload() {
    hideAll();
    document.getElementById("uploadView").classList.remove("hidden");
    // Clear form
    document.getElementById("fileInput").value = "";
    document.getElementById("nameInput").value = "";
    document.getElementById("descInput").value = "";
}

function showYears() {
    hideAll();
    document.getElementById("yearsView").classList.remove("hidden");
}

function openYear(year) {
    hideAll();
    document.getElementById("galleryView").classList.remove("hidden");
    document.getElementById("yearTitle").innerText = `${year} Memories`;
    loadGallery(year);
}

/* ====================== UPLOAD ====================== */
async function saveMemory() {
    const fileInput = document.getElementById("fileInput");
    const title = document.getElementById("nameInput").value.trim();
    const description = document.getElementById("descInput").value.trim();
    const year = document.getElementById("yearInput").value;

    const file = fileInput.files[0];

    if (!file) return alert("Please select a file");
    if (!title) return alert("Please enter a name");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("year", year);

    try {
        const res = await fetch(API + "/add-memory", {
            method: "POST",
            body: formData
        });

        const data = await res.json();

        if (res.ok) {
            alert("Memory saved successfully! 🎉");
            showYears();   // go back to years view
        } else {
            alert("Error: " + data.message);
        }
    } catch (err) {
        console.error(err);
        alert("Failed to upload. Check server connection.");
    }
}

/* ====================== LOAD GALLERY ====================== */
async function loadGallery(year) {
    const gallery = document.getElementById("gallery");
    gallery.innerHTML = "<p>Loading memories...</p>";

    try {
        const res = await fetch(API + "/memories");
        const memories = await res.json();

        gallery.innerHTML = "";

        const filtered = memories.filter(m => m.year == year);

        if (filtered.length === 0) {
            gallery.innerHTML = "<p>No memories found for this year.</p>";
            return;
        }

        filtered.forEach(m => {
            const div = document.createElement("div");
            div.classList.add("memory");

            if (m.fileType.startsWith("image")) {
                div.innerHTML = `<img src="${API}${m.filePath}" alt="${m.title}">`;
            } else {
                div.innerHTML = `
                    <video src="${API}${m.filePath}" muted>
                        Your browser does not support video.
                    </video>`;
            }

            div.onclick = () => openModal(m);
            gallery.appendChild(div);
        });
    } catch (err) {
        console.error(err);
        gallery.innerHTML = "<p>Error loading memories. Is the server running?</p>";
    }
}

/* ====================== MODAL ====================== */
function openModal(memory) {
    const modal = document.createElement("div");
    modal.classList.add("modal");

    let mediaHTML = '';
    if (memory.fileType.startsWith("image")) {
        mediaHTML = `<img src="${API}${memory.filePath}" alt="${memory.title}">`;
    } else {
        mediaHTML = `<video src="${API}${memory.filePath}" controls autoplay></video>`;
    }

    modal.innerHTML = `
        <div class="modal-content">
            ${mediaHTML}
            <h2>${memory.title}</h2>
            <p>${memory.description || 'No description'}</p>
            <button onclick="this.closest('.modal').remove()">Close</button>
        </div>
    `;

    document.body.appendChild(modal);

    // Close when clicking outside content
    modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.remove();
    });
}