const educationContainer = document.getElementById("education-container");
const searchInput = document.getElementById("education-search");

const jsonUrl = educationContainer.dataset.jsonUrl;
const isAuthenticated =
    educationContainer.dataset.authenticated === "true";
const isSuperuser =
    educationContainer.dataset.superuser === "true";
const isEditor =
    educationContainer.dataset.editor === "true";


function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}


function getCSRFToken() {
    const csrfInput = document.querySelector(
        'input[name="csrfmiddlewaretoken"]'
    );

    return csrfInput ? csrfInput.value : "";
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
                onclick="toggleStar('${education.id}', this)"
            >
                ★
                <span class="star-text">
                    ${education.is_starred ? "Unstar" : "Star"}
                </span>

                <span class="star-count">
                    ${education.star_count}
                </span>
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

        <p>
            ${startDate} — ${endDate}
        </p>

        <div class="project-card-actions">
            <div class="project-actions">
                ${buttons}
            </div>
        </div>
    `;

    const editButton =
        card.querySelector(".edit-education-button");

    if (editButton) {
        editButton.addEventListener(
            "click",
            function() {
                openEditEducation(editButton);
            }
        );
    }

    const deleteButton =
        card.querySelector(".delete-education-button");

    if (deleteButton) {
        deleteButton.addEventListener(
            "click",
            function() {
                deleteEducation(
                    education.id,
                    deleteButton
                );
            }
        );
    }

    return card;
}


async function loadEducation(search = "") {
    educationContainer.innerHTML = `
        <p class="empty-state">
            Memuat data pendidikan...
        </p>
    `;

    try {
        const url = search
            ? `${jsonUrl}?search=${encodeURIComponent(search)}`
            : jsonUrl;

        const response = await fetch(url, {
            headers: {
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(
                "Gagal mengambil data pendidikan."
            );
        }

        const educationList = await response.json();

        educationContainer.innerHTML = "";

        if (educationList.length === 0) {
            educationContainer.innerHTML = `
                <p class="empty-state">
                    Pendidikan tidak ditemukan.
                </p>
            `;
            return;
        }

        educationList.forEach(function(education) {
            const card = createEducationCard(education);
            educationContainer.appendChild(card);
        });

    } catch (error) {
        console.error(error);

        educationContainer.innerHTML = `
            <p class="empty-state">
                Gagal memuat data pendidikan.
            </p>
        `;
    }
}


async function toggleStar(educationId, button) {
    try {
        const response = await fetch(
            `/education/${educationId}/star/`,
            {
                method: "POST",
                headers: {
                    "X-CSRFToken": getCSRFToken(),
                    "Accept": "application/json"
                }
            }
        );

        if (!response.ok) {
            throw new Error(
                "Gagal mengubah star."
            );
        }

        const result = await response.json();

        const starText =
            button.querySelector(".star-text");

        const starCount =
            button.querySelector(".star-count");

        starText.textContent =
            result.is_starred
                ? "Unstar"
                : "Star";

        starCount.textContent =
            result.star_count;

        button.classList.toggle(
            "is-starred",
            result.is_starred
        );

    } catch (error) {
        console.error(error);

        showToast(
            "Gagal",
            "Gagal mengubah star.",
            "error"
        );
    }
}


const SEARCH_DEBOUNCE_DELAY = 300;
let searchDebounceTimer;

searchInput.addEventListener(
    "input",
    function() {
        clearTimeout(searchDebounceTimer);

        searchDebounceTimer = setTimeout(
            function() {
                loadEducation(
                    searchInput.value.trim()
                );
            },
            SEARCH_DEBOUNCE_DELAY
        );
    }
);


const educationForm =
    document.getElementById("education-form");


async function addEducation(event) {
    event.preventDefault();

    const submitButton =
        educationForm.querySelector(
            'button[type="submit"]'
        );

    submitButton.disabled = true;

    try {
        const response = await fetch(
            "/education/add-ajax/",
            {
                method: "POST",
                headers: {
                    "X-CSRFToken": getCSRFToken(),
                    "Accept": "application/json"
                },
                body: new FormData(educationForm)
            }
        );

        const result =
            await response.json().catch(
                () => ({})
            );

        if (response.ok) {

            educationForm.reset();

            document
                .getElementById(
                    "add-education-modal"
                )
                .hidePopover();

            showToast(
                "Berhasil",
                "Pendidikan berhasil ditambahkan!",
                "success"
            );

            await loadEducation(
                searchInput.value.trim()
            );

        } else {

            const errorMessages =
                result.errors
                    ? Object.values(result.errors)
                        .flat()
                        .map(
                            error => error.message
                        )
                    : [
                        result.message ||
                        `Terjadi kesalahan (status ${response.status}).`
                    ];

            showToast(
                "Gagal menambahkan pendidikan",
                errorMessages.join(" "),
                "error"
            );
        }

    } catch (error) {

        console.error(error);

        showToast(
            "Gagal",
            "Tidak dapat terhubung ke server. Silakan coba lagi.",
            "error"
        );

    } finally {
        submitButton.disabled = false;
    }
}


if (educationForm) {
    educationForm.addEventListener(
        "submit",
        addEducation
    );
}


loadEducation();

const editEducationForm =
    document.getElementById("edit-education-form");


function openEditEducation(button) {
    const card = button.closest(".experience-card");

    document.getElementById("edit-education-id").value =
        card.dataset.educationId;

    document.getElementById("edit-school").value =
        card.dataset.school;

    document.getElementById("edit-degree").value =
        card.dataset.degree;

    document.getElementById("edit-description").value =
        card.dataset.description;

    document.getElementById("edit-started-at").value =
        card.dataset.startedAt;

    document.getElementById("edit-ended-at").value =
        card.dataset.endedAt;

    document
        .getElementById("edit-education-modal")
        .showPopover();
}

async function updateEducation(event) {
    event.preventDefault();

    const educationId =
        document.getElementById("edit-education-id").value;

    const submitButton =
        editEducationForm.querySelector(
            'button[type="submit"]'
        );

    submitButton.disabled = true;

    try {
        const response = await fetch(
            `/education/${educationId}/edit-ajax/`,
            {
                method: "POST",
                headers: {
                    "X-CSRFToken": getCSRFToken(),
                    "Accept": "application/json"
                },
                body: new FormData(editEducationForm)
            }
        );

        const result =
            await response.json().catch(
                () => ({})
            );

        if (response.ok) {

            document
                .getElementById("edit-education-modal")
                .hidePopover();

            showToast(
                "Berhasil",
                "Pendidikan berhasil diperbarui!",
                "success"
            );

            await loadEducation(
                searchInput.value.trim()
            );

        } else {

            const errorMessages =
                result.errors
                    ? Object.values(result.errors)
                        .flat()
                        .map(
                            error => error.message
                        )
                    : [
                        result.message ||
                        `Terjadi kesalahan (status ${response.status}).`
                    ];

            showToast(
                "Gagal",
                errorMessages.join(" "),
                "error"
            );
        }

    } catch (error) {

        console.error(error);

        showToast(
            "Gagal",
            "Tidak dapat terhubung ke server. Silakan coba lagi.",
            "error"
        );

    } finally {
        submitButton.disabled = false;
    }
}


if (editEducationForm) {
    editEducationForm.addEventListener(
        "submit",
        updateEducation
    );
}

async function deleteEducation(
    educationId,
    button
) {
    const confirmed = confirm(
        "Yakin ingin menghapus pendidikan ini?"
    );

    if (!confirmed) {
        return;
    }

    button.disabled = true;

    try {
        const response = await fetch(
            `/education/${educationId}/delete-ajax/`,
            {
                method: "POST",
                headers: {
                    "X-CSRFToken": getCSRFToken(),
                    "Accept": "application/json"
                }
            }
        );

        const result =
            await response.json().catch(
                () => ({})
            );

        if (response.ok) {

            showToast(
                "Berhasil",
                "Pendidikan berhasil dihapus!",
                "success"
            );

            await loadEducation(
                searchInput.value.trim()
            );

        } else {

            showToast(
                "Gagal",
                result.message ||
                `Gagal menghapus pendidikan (status ${response.status}).`,
                "error"
            );

            button.disabled = false;
        }

    } catch (error) {

        console.error(error);

        showToast(
            "Gagal",
            "Tidak dapat terhubung ke server. Silakan coba lagi.",
            "error"
        );

        button.disabled = false;
    }
}