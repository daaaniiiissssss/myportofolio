const experienceContainer = document.getElementById("experience-container");
const searchInput = document.getElementById("experience-search");
const experienceForm = document.getElementById("experience-form");
const editExperienceForm = document.getElementById("edit-experience-form");

const LIST_URL = experienceContainer.dataset.listUrl;
const DETAIL_URL = experienceContainer.dataset.detailUrl;
const STAR_URL = experienceContainer.dataset.starUrl;
const LOGIN_URL = experienceContainer.dataset.loginUrl;
const ZERO_UUID = "00000000-0000-0000-0000-000000000000";

const isAuthenticated = experienceContainer.dataset.authenticated === "true";
const isSuperuser = experienceContainer.dataset.superuser === "true";
const isEditor = experienceContainer.dataset.editor === "true";

const SEARCH_DEBOUNCE_DELAY = 300;
let searchDebounceTimer;
let experienceAbortController;


function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}


function getCookie(name) {
    const prefix = `${name}=`;
    const cookie = document.cookie
        .split(";")
        .map(value => value.trim())
        .find(value => value.startsWith(prefix));

    return cookie
        ? decodeURIComponent(cookie.slice(prefix.length))
        : null;
}


function getCSRFToken() {
    const fromCookie = getCookie("csrftoken");
    if (fromCookie) return fromCookie;

    const csrfInput = document.querySelector(
        'input[name="csrfmiddlewaretoken"]'
    );
    return csrfInput ? csrfInput.value : "";
}


function experienceEndpoint(pattern, id) {
    return pattern.replace(ZERO_UUID, id);
}


function apiErrorMessage(data, status) {
    const messages = Object.values(data)
        .flat()
        .filter(value => typeof value === "string");

    return messages.join(" ") || `Request failed (HTTP ${status}).`;
}


async function writeExperience(url, method, payload) {
    const response = await fetch(url, {
        method,
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRFToken(),
        },
        body: payload === undefined ? undefined : JSON.stringify(payload),
    });

    if (response.status === 204) return null;

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(apiErrorMessage(data, response.status));
    }

    return data;
}


function experiencePayload(form) {
    const fields = new FormData(form);
    const endedAt = fields.get("ended_at");

    return {
        title: fields.get("title"),
        category: fields.get("category"),
        description: fields.get("description"),
        thumbnail: fields.get("thumbnail") || null,
        // The API field is a DateTime; the form only collects a date.
        ended_at: endedAt ? `${endedAt}T00:00:00` : null,
    };
}


function createExperienceCard(experience) {
    const card = document.createElement("article");
    card.className = "experience-card";

    card.dataset.experienceId = experience.id;
    card.dataset.title = experience.title;
    card.dataset.category = experience.category;
    card.dataset.description = experience.description;
    card.dataset.thumbnail = experience.thumbnail || "";
    card.dataset.endedAt = experience.ended_at
        ? experience.ended_at.slice(0, 10)
        : "";

    const image = experience.thumbnail
        ? `<img src="${escapeHtml(experience.thumbnail)}"
                alt="${escapeHtml(experience.title)}"
                class="project-image">`
        : "";

    const status = experience.is_ongoing
        ? "Sedang berlangsung"
        : `Selesai (${escapeHtml(experience.ended_at.slice(0, 10))})`;

    let buttons = "";

    if (isAuthenticated) {
        buttons += `
            <button
                type="button"
                class="button button-star${experience.is_starred ? " is-starred" : ""}"
                data-action="star"
                title="${escapeHtml(experience.starred_by_names)}"
            >
                ★
                <span class="star-text">${experience.is_starred ? "Unstar" : "Star"}</span>
                <span class="star-count">${experience.star_count}</span>
            </button>
        `;
    } else {
        buttons += `
            <a href="${escapeHtml(LOGIN_URL)}" class="button">
                Login to star (${experience.star_count})
            </a>
        `;
    }

    if (isSuperuser || isEditor) {
        buttons += `
            <button
                type="button"
                class="button button-secondary"
                data-action="edit"
            >
                Edit
            </button>
        `;
    }

    if (isSuperuser) {
        buttons += `
            <button
                type="button"
                class="button button-danger"
                data-action="delete"
            >
                Hapus
            </button>
        `;
    }

    card.innerHTML = `
        ${image}

        <span class="experience-category">
            ${escapeHtml(experience.category_display)}
        </span>

        <h2>${escapeHtml(experience.title)}</h2>

        <p class="experience-description">
            ${escapeHtml(experience.description)}
        </p>

        <p class="experience-status">${status}</p>

        <div class="project-card-actions">
            <div class="project-actions">
                ${buttons}
            </div>
        </div>
    `;

    const starButton = card.querySelector('[data-action="star"]');
    if (starButton) {
        starButton.addEventListener("click", function() {
            toggleStar(experience.id, starButton);
        });
    }

    const editButton = card.querySelector('[data-action="edit"]');
    if (editButton) {
        editButton.addEventListener("click", function() {
            openEditExperience(card);
        });
    }

    const deleteButton = card.querySelector('[data-action="delete"]');
    if (deleteButton) {
        deleteButton.addEventListener("click", function() {
            deleteExperience(experience.id, deleteButton);
        });
    }

    return card;
}


async function loadExperience(search = "") {
    if (experienceAbortController) experienceAbortController.abort();
    experienceAbortController = new AbortController();

    experienceContainer.innerHTML = `
        <p class="empty-state">Memuat data pengalaman...</p>
    `;

    try {
        const url = new URL(LIST_URL, window.location.origin);
        if (search) url.searchParams.set("search", search);

        const response = await fetch(url, {
            headers: { "Accept": "application/json" },
            signal: experienceAbortController.signal,
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const experienceList = await response.json();

        if (experienceList.length === 0) {
            experienceContainer.innerHTML = `
                <p class="empty-state">
                    Belum ada pengalaman yang ditambahkan.
                </p>
            `;
            return;
        }

        experienceContainer.replaceChildren(
            ...experienceList.map(createExperienceCard)
        );

    } catch (error) {
        if (error.name === "AbortError") return;

        console.error(error);
        experienceContainer.innerHTML = `
            <p class="empty-state">Gagal memuat data pengalaman.</p>
        `;
    }
}


async function toggleStar(experienceId, button) {
    if (button.disabled) return;
    button.disabled = true;

    try {
        const result = await writeExperience(
            experienceEndpoint(STAR_URL, experienceId),
            "POST"
        );

        button.querySelector(".star-text").textContent =
            result.is_starred ? "Unstar" : "Star";
        button.querySelector(".star-count").textContent = result.star_count;
        button.classList.toggle("is-starred", result.is_starred);
        button.title = result.starred_by_names;

    } catch (error) {
        console.error(error);
        showToast("Gagal", error.message, "error");
    } finally {
        button.disabled = false;
    }
}


async function addExperience(event) {
    event.preventDefault();

    const submitButton = experienceForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    try {
        await writeExperience(
            LIST_URL,
            "POST",
            experiencePayload(experienceForm)
        );

        experienceForm.reset();
        document.getElementById("add-experience-modal").hidePopover();

        showToast("Berhasil", "Pengalaman berhasil ditambahkan!", "success");
        await loadExperience(searchInput.value.trim());

    } catch (error) {
        console.error(error);
        showToast("Gagal menambahkan pengalaman", error.message, "error");
    } finally {
        submitButton.disabled = false;
    }
}


function openEditExperience(card) {
    document.getElementById("edit-experience-id").value =
        card.dataset.experienceId;
    document.getElementById("edit-title").value = card.dataset.title;
    document.getElementById("edit-category").value = card.dataset.category;
    document.getElementById("edit-description").value =
        card.dataset.description;
    document.getElementById("edit-thumbnail").value = card.dataset.thumbnail;
    document.getElementById("edit-ended-at").value = card.dataset.endedAt;

    document.getElementById("edit-experience-modal").showPopover();
}


async function updateExperience(event) {
    event.preventDefault();

    const experienceId = document.getElementById("edit-experience-id").value;
    const submitButton = editExperienceForm.querySelector(
        'button[type="submit"]'
    );
    submitButton.disabled = true;

    try {
        await writeExperience(
            experienceEndpoint(DETAIL_URL, experienceId),
            "PATCH",
            experiencePayload(editExperienceForm)
        );

        document.getElementById("edit-experience-modal").hidePopover();

        showToast("Berhasil", "Pengalaman berhasil diperbarui!", "success");
        await loadExperience(searchInput.value.trim());

    } catch (error) {
        console.error(error);
        showToast("Gagal", error.message, "error");
    } finally {
        submitButton.disabled = false;
    }
}


async function deleteExperience(experienceId, button) {
    if (!confirm("Yakin ingin menghapus pengalaman ini?")) return;

    button.disabled = true;

    try {
        await writeExperience(
            experienceEndpoint(DETAIL_URL, experienceId),
            "DELETE"
        );

        showToast("Berhasil", "Pengalaman berhasil dihapus!", "success");
        await loadExperience(searchInput.value.trim());

    } catch (error) {
        console.error(error);
        showToast("Gagal", error.message, "error");
        button.disabled = false;
    }
}


searchInput.addEventListener("input", function() {
    clearTimeout(searchDebounceTimer);

    searchDebounceTimer = setTimeout(function() {
        loadExperience(searchInput.value.trim());
    }, SEARCH_DEBOUNCE_DELAY);
});

if (experienceForm) {
    experienceForm.addEventListener("submit", addExperience);
}

if (editExperienceForm) {
    editExperienceForm.addEventListener("submit", updateExperience);
}

loadExperience();