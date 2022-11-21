let alert = document.querySelector(".alert");
let form = document.querySelector(".grocery-form");
let grocery = document.getElementById("grocery-input");
let submit = document.querySelector(".submit-btn");
let container = document.querySelector(".grocery-container");
let list = document.querySelector(".grocery-list");
let clearBtn = document.querySelector(".clear-btn");

// edit option
let editElement;
let editFlag = false;
let editID = "";

/*
* ----EVENTS LISTENER----
*/
form.addEventListener("submit", addItem);
clearBtn.addEventListener("click", clearAll);
// carichiamo gli elementi(se presenti) del local storage
window.addEventListener("DOMContentLoaded", setupItems);

/*
* ----FUNCTIONS----
*/
function addItem(eventObj) {
    eventObj.preventDefault(); // serve per impedire alla form di effettuare un classico submit
    let value = grocery.value;
    /*
        per creare un ID unico sfrutteremo getTime(), che restituiscce l'orario'
        odierna in milli secondi e lo convertiremo in stringa.
    */
    let id = new Date().getTime().toString();
    if (value && !editFlag) { // equivalente a value !== '' && editFlag === false
        createListItem(id, value);
        showContainer();
        showAlert("item added to the list", "alert-success");
        removeAlert(1000);

        // aggiungiamo al local storage
        addToLocalStorage(id, value);
        // torniamo ai valori di default
        backToDefault();

    } else if (value && editFlag) {
        editElement.innerHTML = value;
        showAlert("value changed", "alert-success");
        removeAlert(1000);
        // edit local storage
        editLocalStorage(editID, value);
        backToDefault();
    } else {
        // showw alert
        showAlert("please enter a value", "alert-danger");
        // remove alert
        removeAlert(1000);
    }
}
/*
*   ----ALERTS----
*/
// show alert
function showAlert(text, type) {
    alert.textContent = text;
    alert.classList.add("visible");
    alert.classList.add(type);
}

/*  
    funzione che rimuove l'alert dopo un tempo da me deciso (in ms)
    e re-inizializza la classe alert
*/
function removeAlert(time) {
    setTimeout(function () {
        alert.className = "alert";
    }, time);
}

/*
*   ----CONTAINER----
*/
// mostra container
function showContainer() {
    container.classList.add("visible");
}

// nascondi container
function hideContainer() {
    container.classList.remove("visible");
}

// pulisci tutto il container
function clearAll() {
    $(document).ready(function () {
        $(container).empty();
    });
    hideContainer();
    showAlert("empty list", "alert-warning");
    removeAlert(1000);
    backToDefault();
    localStorage.removeItem("list");
}

/*
*   ----LOCAL STORAGE----
*/
// aggiungi item al local storage
function addToLocalStorage(id, value) {
    const grocery = {id:id, value:value};
    let items = getLocalStorage();
    console.log(items)

    items.push(grocery);
    localStorage.setItem("list", JSON.stringify(items));
}

// funzione per recuperare la lista dal local storage
function getLocalStorage() {
    let items = localStorage.getItem("list");
    /**
     * se non abbiamo già definito una chiave list, al primo giro
     * items restituirà un array vuoto. In questo caso andremo alla fine
     * a definirlo noi con localStorage.setItem(). Se, invece, esiste già,
     * pusho il nuovo oggetto dentro all'array.
     */
    if(items) {
        items = JSON.parse(localStorage.getItem("list"));
    } else {
        items = [];
    }
    return items;

}

// pulisce l'input text e riporta al valore di default tutti i parametri
function backToDefault() {
    grocery.value = "";
    editFlag = false;
    editID = "";
    submit.textContent = "submit";
}

function removeFromLocalStorage(id) {
    let items = getLocalStorage();
    /**
     * Quello che faccio è andare a selezionare nell'array tutti gli oggetti il cui
     * id NON corrisponde con quello che voglio eliminare. Poi sovrascrivo la nuova
     * lista con tutti gli oggetti, meno quello che corrisponde all'ID.
     */
    items = items.filter(function(item){
        if(item.id !== id) {
            return item;
        }
    });
    localStorage.setItem("list", JSON.stringify(items));
}

function editLocalStorage(id, value) {
    let items = getLocalStorage();
    /**
     * questa volta seleziono solo l'oggetto il cui id corrisponde a 
     * quello che gli passo nella funzione e ne sovrascrivo il valore con quello
     * nuovo dell'edit.
     */
    items = items.map(function(item){
        if(item.id === id) {
            item.value = value;
        }
        return item;
    });
    localStorage.setItem("list", JSON.stringify(items));
}
/*
*   ----EDITING DELL'ITEM----
*/
// edit item
function editItem(eventObj) {
    const element = eventObj.currentTarget.parentElement.parentElement;
    // set edit item
    /*
    *   con questo metodo mi recupero il titolo
    */
    editElement = eventObj.currentTarget.parentElement.previousElementSibling;
    // set form value
    grocery.value = editElement.innerHTML;
    editFlag = true;
    editID = element.dataset.id;
    // set submit button
    submit.textContent = "edit";
}

// cancella item
function deleteItem(eventObj) {
    /*
    *   spiegazione del codice:
    *   - con current target ci riferiamo al bottone che premiamo
    *   - col primo parentElement accediamo all'elemento parent del bottone
    *     ovvero .btn-container
    *   - col secondo parentElement arriviamo a ciò che cerchiamo, cioè
    *     .grocery-item con il suo specifico ID
    */
    const element = eventObj.currentTarget.parentElement.parentElement;
    const id = element.dataset.id;
    // ora possiamo rimuovere l'elemento dalla lista
    list.removeChild(element);

    // se non ci sono più items, nascondiamo il container
    if (list.children.length === 0) {
        hideContainer();
    }

    showAlert("item removed", "alert-danger");
    removeAlert(1000);
    backToDefault();
    // rimuoviamo l'elemento dal local storage
    removeFromLocalStorage(id);
}

/**
 * * SETUP ITEMS
 */

function setupItems() {
    let items = getLocalStorage();
    if(items.length > 0) {
        items.forEach(item => {
            createListItem(item.id, item.value);
        });
        showContainer();
    }
}

function createListItem(id, value) {
    let element = document.createElement("div");
    element.classList.add("grocery-item");
    element.setAttribute("data-id", id);
    element.innerHTML = `
        <p class="title text-capitalize">${value}</p>
        <div class="btn-container">
            <button type="button" class="edit-btn"><i class="fas fa-edit"></i></button>
            <button type="button" class="delete-btn"><i class="fas fa-trash"></i></button>
        </div>
        `;
    // edit functions
    let deleteBtn = element.querySelector(".delete-btn");
    let editBtn = element.querySelector(".edit-btn");
    deleteBtn.addEventListener("click", deleteItem);
    editBtn.addEventListener("click", editItem);

    // appendiamo l'elemento alla lista
    list.appendChild(element)
}