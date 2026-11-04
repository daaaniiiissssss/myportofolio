const educationContainer = document.getElementById("education-container");
const searchInput = document.getElementById("education-search");
const educationForm = document.getElementById("education-form");
const editEducationForm = document.getElementById("edit-education-form");

const LIST_URL = educationContainer.dataset.listUrl;
const DETAIL_URL = educationContainer.dataset.detailUrl;
const STAR_URL = educationContainer.dataset.starUrl;

const isAuthenticated = educationContainer.dataset.authenticated === "true";
const isSuperuser = educationContainer.dataset.superuser === "true";
const isEditor = educationContainer.dataset.editor === "true";

const SEARCH_DEBOUNCE_DELAY = 300;
let searchDebounceTimer;
let educationAbortController;


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


// "/api/v1/education/0/" -> "/api/v1/education/<id>/"
function educationEndpoint(pattern, id) {
    return pattern.replace(/\/0\/(star\/)?$/, `/${id}/$1`);
}


function apiErrorMessage(data, status) {
    const messages = Object.values(data)
        .flat()
        .filter(value => typeof value === "string");

    return messages.join(" ") || `Request failed (HTTP ${status}).`;
}


async function writeEducation(url, method, payload) {
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


function educationPayload(form) {
    const fields = new FormData(form);

    return {
        school: fields.get("school"),
        degree: fields.get("degree"),
        description: fields.get("description"),
        started_at: fields.get("started_at"),
        ended_at: fields.get("ended_at") || null,
    };
}


function createEducationCard(education) {
    const card = document.createElement("article");
    card.className = "experience-card";

    card.dataset.educationId = education.id;
    card.dataset.school = education.school;
    card.dataset.degree = education.degree;
    card.dataset.description = education.description;
    card.dataset.startedAt = education.started_at;
    card.dataset.endedAt = education.ended_at || "";

    const startDate = escapeHtml(education.started_at);
    const endDate = education.ended_at
        ? escapeHtml(education.ended_at)
        : "Sekarang";

    let buttons = "";

    if (isAuthenticated) {
        buttons += `
            <button
                type="button"
                class="button button-star${education.is_starred ? " is-starred" : ""}"
                data-action="star"
                title="${escapeHtml(education.starred_by_names)}"
            >
                ★
                <span class="star-text">${education.is_starred ? "Unstar" : "Star"}</span>
                <span class="star-count">${education.star_count}</span>
            </button>
        `;
    }

    if (isSuperuser || isEditor) {
        buttons += `
            <button
                type="button"
                class="button button-secondary edit-education-button"
            >
                Edit
            </button>
        `;
    }

    if (isSuperuser) {
        buttons += `
            <button
                type="button"
                class="button button-danger delete-education-button"
            >
                Hapus
            </button>
        `;
    }

    card.innerHTML = `
        <h2>${escapeHtml(education.school)}</h2>

        <span class="experience-category">
            ${escapeHtml(education.degree)}
        </span>

        <p class="experience-description">
            ${escapeHtml(education.description)}
        </p>

        <p>${startDate} — ${endDate}</p>

        <div class="project-card-actions">
            <div class="project-actions">
                ${buttons}
            </div>
        </div>
    `;

    const starButton = card.querySelector('[data-action="star"]');
    if (starButton) {
        starButton.addEventListener("click", function() {
            toggleStar(education.id, starButton);
        });
    }

    const editButton = card.querySelector(".edit-education-button");
    if (editButton) {
        editButton.addEventListener("click", function() {
            openEditEducation(editButton);
        });
    }

    const deleteButton = card.querySelector(".delete-education-button");
    if (deleteButton) {
        deleteButton.addEventListener("click", function() {
            deleteEducation(education.id, deleteButton);
        });
    }

    return card;
}


async function loadEducation(search = "") {
    if (educationAbortController) educationAbortController.abort();
    educationAbortController = new AbortController();

    educationContainer.innerHTML = `
        <p class="empty-state">Memuat data pendidikan...</p>
    `;

    try {
        const url = new URL(LIST_URL, window.location.origin);
        if (search) url.searchParams.set("search", search);

        const response = await fetch(url, {
            headers: { "Accept": "application/json" },
            signal: educationAbortController.signal,
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const educationList = await response.json();

        if (educationList.length === 0) {
            educationContainer.innerHTML = `
                <p class="empty-state">Pendidikan tidak ditemukan.</p>
            `;
            return;
        }

        educationContainer.replaceChildren(
            ...educationList.map(createEducationCard)
        );

    } catch (error) {
        if (error.name === "AbortError") return;

        console.error(error);
        educationContainer.innerHTML = `
            <p class="empty-state">Gagal memuat data pendidikan.</p>
        `;
    }
}


async function toggleStar(educationId, button) {
    if (button.disabled) return;
    button.disabled = true;

    try {
        const result = await writeEducation(
            educationEndpoint(STAR_URL, educationId),
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


async function addEducation(event) {
    event.preventDefault();

    const submitButton = educationForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    try {
        await writeEducation(
            LIST_URL,
            "POST",
            educationPayload(educationForm)
        );

        educationForm.reset();
        document.getElementById("add-education-modal").hidePopover();

        showToast("Berhasil", "Pendidikan berhasil ditambahkan!", "success");
        await loadEducation(searchInput.value.trim());

    } catch (error) {
        console.error(error);
        showToast("Gagal menambahkan pendidikan", error.message, "error");
    } finally {
        submitButton.disabled = false;
    }
}


function openEditEducation(button) {
    const card = button.closest(".experience-card");

    document.getElementById("edit-education-id").value =
        card.dataset.educationId;
    document.getElementById("edit-school").value = card.dataset.school;
    document.getElementById("edit-degree").value = card.dataset.degree;
    document.getElementById("edit-description").value =
        card.dataset.description;
    document.getElementById("edit-started-at").value =
        card.dataset.startedAt;
    document.getElementById("edit-ended-at").value = card.dataset.endedAt;

    document.getElementById("edit-education-modal").showPopover();
}


async function updateEducation(event) {
    event.preventDefault();

    const educationId = document.getElementById("edit-education-id").value;
    const submitButton = editEducationForm.querySelector(
        'button[type="submit"]'
    );
    submitButton.disabled = true;

    try {
        await writeEducation(
            educationEndpoint(DETAIL_URL, educationId),
            "PATCH",
            educationPayload(editEducationForm)
        );

        document.getElementById("edit-education-modal").hidePopover();

        showToast("Berhasil", "Pendidikan berhasil diperbarui!", "success");
        await loadEducation(searchInput.value.trim());

    } catch (error) {
        console.error(error);
        showToast("Gagal", error.message, "error");
    } finally {
        submitButton.disabled = false;
    }
}


async function deleteEducation(educationId, button) {
    if (!confirm("Yakin ingin menghapus pendidikan ini?")) return;

    button.disabled = true;

    try {
        await writeEducation(
            educationEndpoint(DETAIL_URL, educationId),
            "DELETE"
        );

        showToast("Berhasil", "Pendidikan berhasil dihapus!", "success");
        await loadEducation(searchInput.value.trim());

    } catch (error) {
        console.error(error);
        showToast("Gagal", error.message, "error");
        button.disabled = false;
    }
}


searchInput.addEventListener("input", function() {
    clearTimeout(searchDebounceTimer);

    searchDebounceTimer = setTimeout(function() {
        loadEducation(searchInput.value.trim());
    }, SEARCH_DEBOUNCE_DELAY);
});

if (educationForm) {
    educationForm.addEventListener("submit", addEducation);
}

if (editEducationForm) {
    editEducationForm.addEventListener("submit", updateEducation);
}

loadEducation();