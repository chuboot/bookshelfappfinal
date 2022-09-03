//document pertama kali diload
const books = [];
const RENDER_EVENT = "render-book";
const SEARCH_EVENT = "search-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOK_APPS";

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.querySelector("#inputBook");
  const searchForm = document.querySelector("#searchBook");
  submitForm.addEventListener("submit", function (ev) {
    ev.preventDefault();
    addBook();
    submitForm.reset();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }

  searchForm.addEventListener("submit", function (e) {
    e.preventDefault();
    searchBook();
  });
});

function searchBook() {
  document.dispatchEvent(new Event(SEARCH_EVENT));
}

function addBook() {
  const titleBook = document.querySelector("#inputBookTitle").value;
  const authorBook = document.querySelector("#inputBookAuthor").value;
  const yearBook = document.querySelector("#inputBookYear").value;
  const statusBook =
    document.querySelector("#inputBookIsComplete:checked") !== null;

  const generateID = generateId();
  const bookObject = generateBookObject(
    generateID,
    titleBook,
    authorBook,
    yearBook,
    statusBook
  );
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

function makeBook(bookObject) {
  const textTitle = document.createElement("h3");
  textTitle.innerText = bookObject.title;

  const textAuthor = document.createElement("p");
  textAuthor.innerText = bookObject.author;
  textAuthor.classList.add("author");

  const textYear = document.createElement("p");
  textYear.innerText = bookObject.year;

  const statusButton = document.createElement("p");
  statusButton.classList.add("btn-arrow");
  if (bookObject.isComplete) {
    statusButton.innerHTML =
      'Belum Selesai dibaca <i class="fa-solid fa-arrow-left-long"></i>';
    statusButton.addEventListener("click", function () {
      moveToUncompleteRead(bookObject.id);
    });
  } else {
    statusButton.innerHTML =
      'Selesai dibaca <i class="fa-solid fa-arrow-right-long"></i>';
    statusButton.addEventListener("click", function () {
      moveToCompleteRead(bookObject.id);
    });
  }
  const removeButton = document.createElement("p");
  removeButton.innerText = "Hapus buku";
  removeButton.classList.add("btn-delete");

  removeButton.addEventListener("click", function () {
    removeBookFromShelf(bookObject.id);
  });

  const imageCard = document.createElement("img");

  let images = ["1.jpg", "2.jpg", "3.jpg"];

  let length = images.length;
  let rand = Math.floor(length * Math.random());
  imageCard.src = "./assets/img/" + images[rand];

  const picContainer = document.createElement("div");
  picContainer.classList.add("pic");
  picContainer.append(imageCard);
  const detailContainer = document.createElement("div");
  detailContainer.classList.add("detail");
  detailContainer.append(
    textTitle,
    textAuthor,
    textYear,
    statusButton,
    removeButton
  );

  const container = document.createElement("div");
  container.classList.add("card");
  container.append(picContainer, detailContainer);
  container.setAttribute("id", `book-${bookObject.id}`);
  return container;
}

function removeBookFromShelf(bookId) {
  const bookTarget = findBookIndex(bookId);
  const modal = document.querySelector("#myModal");
  const closeBtn = document.querySelector("#close");
  const noBtn = document.querySelector("#noButton");
  const yesBtn = document.querySelector("#yesButton");
  modal.style.display = "block";
  closeBtn.addEventListener("click", function () {
    modal.style.display = "none";
  });
  noBtn.addEventListener("click", function () {
    modal.style.display = "none";
  });
  // window.addEventListener("click", function (ev) {
  //   if (ev.target == modal) {
  //     modal.style.display = "none";
  //   }
  // });
  yesBtn.addEventListener("click", function () {
    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
    modal.style.display = "none";
  });
}

function moveToUncompleteRead(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function moveToCompleteRead(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener(SAVED_EVENT, function () {
  const alertSuccess = document.querySelector("#myAlert");
  alertSuccess.style.display = "block";
  setTimeout(function () {
    alertSuccess.style.display = "none";
  }, 1200);
});

document.addEventListener(RENDER_EVENT, function () {
  // console.log(books);
  const uncompleteBookRead = document.querySelector("#incompleteBookshelfList");
  uncompleteBookRead.innerHTML = "";
  const textTitleUn = document.createElement("h3");
  textTitleUn.innerText = "Belum Selesai dibaca";
  textTitleUn.classList.add("titleRak", "color1");
  uncompleteBookRead.append(textTitleUn);

  const completeBookRead = document.querySelector("#completeBookshelfList");
  completeBookRead.innerHTML = "";
  const textTitleCom = document.createElement("h3");
  textTitleCom.classList.add("titleRak", "color2");
  textTitleCom.innerText = "Selesai dibaca";
  completeBookRead.append(textTitleCom);

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);

    if (!bookItem.isComplete) {
      uncompleteBookRead.append(bookElement);
    } else {
      completeBookRead.append(bookElement);
    }
  }
});
document.addEventListener(SEARCH_EVENT, function () {
  // console.log(books);
  const uncompleteBookRead = document.querySelector("#incompleteBookshelfList");
  uncompleteBookRead.innerHTML = "";
  const textTitleUn = document.createElement("h3");
  textTitleUn.innerText = "Belum Selesai dibaca";
  textTitleUn.classList.add("titleRak", "color1");
  uncompleteBookRead.append(textTitleUn);

  const completeBookRead = document.querySelector("#completeBookshelfList");
  completeBookRead.innerHTML = "";
  const textTitleCom = document.createElement("h3");
  textTitleCom.classList.add("titleRak", "color2");
  textTitleCom.innerText = "Selesai dibaca";
  completeBookRead.append(textTitleCom);

  const titleSearch = document
    .querySelector("#searchBookTitle")
    .value.toLowerCase();

  for (const book of books) {
    const itemBook = book.title;
    if (itemBook.toLowerCase().includes(titleSearch)) {
      const bookElement = makeBook(book);

      if (!book.isComplete) {
        uncompleteBookRead.append(bookElement);
      } else {
        completeBookRead.append(bookElement);
      }
    }
  }
});
