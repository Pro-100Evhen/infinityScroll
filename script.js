let page = 1;
const searchInput = document.querySelector("#searchInput");
const listOfPhotos = document.querySelector("#imageGrid");
const loader = document.querySelector("#loader");

async function getImagesSync(searchTarget, number, APILink = "https://pixabay.com/api", APIKey = "47404711-d9fc162fb66b5df107f653975", currentPage = page) {
    try {
        if (!navigator.onLine) {
            throw new Error("Відсутнє з'єднання з інтернетом. Будь ласка, перевірте своє підключення.");
        }

        const response = await fetch(`${APILink}?key=${APIKey}&q=${searchTarget}&page=${page}&per_page=${number}`);
        
        if (!response.ok) {
            throw new Error(`Помилка: ${response.status}. Неможливо отримати дані.`);
        }

        const data = await response.json();

        if (data.hits.length > 0) {
            page++;
            loader.style.display = "block";
            return data.hits;
        } else if (page === 1) {
            const labelNoImage = document.createElement("h3");
            labelNoImage.textContent = "Немає зображень за цим запитом";
            listOfPhotos.appendChild(labelNoImage);
        } else {
            const labelNoImageMore = document.createElement("h3");
            labelNoImageMore.textContent = "Немає більше зображень за цим запитом";
            listOfPhotos.appendChild(labelNoImageMore);
        }
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

function renderPhoto(Url) {
    const newImage = document.createElement("img");
    newImage.src = `${Url}`;
    newImage.classList.add("image-item");
    listOfPhotos.appendChild(newImage);
}

function addNewPhotos(photos) {
    photos.forEach((photo) => renderPhoto(photo.webformatURL));
}

function debounce(func, timeout = 1000) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, timeout);
    };
}

const processChange = debounce(() => {
    try {
        if (searchInput.value === "") {
            listOfPhotos.innerHTML = "";
            page = 1;
            return;
        }

        getImagesSync(`${searchInput.value}`, 12)
            .then((data) => {
                if (data) addNewPhotos(data);
            })
            .catch((error) => console.error(error));
    } catch (error) {
        console.error("Помилка під час оновлення зображень:", error);
        alert("Сталася помилка при обробці запиту.");
    }
});

searchInput.addEventListener("keyup", (event) => {
    try {
        if (event.key === "Backspace") {
            listOfPhotos.innerHTML = "";
            page = 1;
        }
        processChange();
    } catch (error) {
        console.error("Помилка обробки події:", error);
    }
});

searchInput.addEventListener("keyup", () => {
    try {
        processChange();
    } catch (error) {
        console.error("Помилка обробки події:", error);
    }
});

document.addEventListener("scroll", () => {
    try {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
            getImagesSync(`${searchInput.value}`, 12)
                .then((data) => {
                    if (data) addNewPhotos(data);
                })
                .catch((error) => console.error(error));
        }
    } catch (error) {
        console.error("Помилка під час прокручування сторінки:", error);
    }
});
