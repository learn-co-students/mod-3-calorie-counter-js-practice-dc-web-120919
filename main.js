
const calorieEntriesDB = 'http://localhost:3000/api/v1/calorie_entries';

let editID;
let deleteID;


document.addEventListener("DOMContentLoaded", (e)=> {

    console.log('connected to JS..')
    fetchDatabase();
    document.addEventListener('click', (e)=> clickHandler(e))

});

function clickHandler(event){
    event.preventDefault();
    console.log(event);
    console.log(`You clicked on a ${event.target.tagName}`);
    console.log(event.target.className);
    let editCaloriesField = document.getElementById('form-edit-calories-field');
    let editNotesField = document.getElementById('form-edit-notes-field');

    if(event.target.parentElement.parentElement=== document.getElementById('new-calorie-form')){
        console.log(`You've submitted a new meal`)
        let calories = event.target.parentElement.firstElementChild.firstElementChild.value;
        let notes = event.target.parentElement.children[1].firstElementChild.value;
        console.log(`Calories: ${calories}, Notes: ${notes}`);
        fetch(`${calorieEntriesDB}`, {
            method: 'POST',
            body: JSON.stringify({calorie: calories, note: notes}),
            headers: {
                'Content-type': 'application/json'
            }
        }).then(response => response.json())
        .then(newMeal => renderMeal(newMeal));
    }
    else if(event.target===document.getElementById('edit-entry-button')){
        console.log("Edited!");
        console.log(event.target.parentElement.parentElement)
        let newCalories = parseInt(event.target.parentElement.firstElementChild.firstElementChild.value, 10);
        let newNotes = event.target.parentElement.children[1].firstElementChild.value;
        
        let editEntry = {calorie: newCalories, note: newNotes}
        fetch(`${calorieEntriesDB}/${editID}`, {
            method: 'PATCH', 
            body: JSON.stringify(editEntry),
            headers: {
                'Content-type': 'application/json'
            }
        }).then(response => response.json())
        .then(editedMeal => editMeal(editedMeal));
    }
    else if (event.target.parentElement.className === 'delete-button uk-icon'){
        let mealID = parseInt(event.target.parentElement.dataset.id, 10);
        console.log(`clicked on the trash can for ${mealID}`);

        //delete the element here
        fetch(`${calorieEntriesDB}/${mealID}`, {
            method: 'DELETE'
        })
        deleteEntry(mealID);
    }
    else if(event.target.tagName === 'svg'){
        //sets the global editID dataset.id to this element's id, needed because form doesn't have id
        editID = parseInt(event.target.dataset.id, 10);
        editCaloriesField.value = document.querySelector(`strong[data-id="${editID}"]`).innerText;
        editNotesField.value = document.querySelector(`em[data-id="${editID}"]`).innerText;
    }
    else if(event.target.tagName === 'path'){
        editID = parseInt(event.target.dataset.id, 10)
        editCaloriesField.value = document.querySelector(`strong[data-id="${editID}"]`).innerText;
        editNotesField.value = document.querySelector(`em[data-id="${editID}"]`).innerText;
    }
    else if(event.target === document.getElementById('bmr-submit-button')){
        calculateBMR(event);
    }
}

function calculateBMR(event){
    console.log(event);
    // debugger;
    let form = event.target.parentElement;
    let weight = parseInt(form.children[1].firstElementChild.value);
    let height = parseInt(form.children[2].firstElementChild.value);
    let age = parseInt(form.children[3].firstElementChild.value);

    console.log(`Weight: ${weight}, Height: ${height}, Age: ${age}`);

    //note: lower range is typically ascribed to women, higher for men 
    //using the Harris-Benedict formula. However, this app will use both as a range
    //and will calculate based on average 
    let lowerRange = parseInt(655 + (4.35*weight) + (4.7*height) - (4.7*age));
    let upperRange = parseInt(66 + (6.23*weight) + (12.7*height) - (6.8*age));
    let average = parseInt((lowerRange+upperRange)/2);

    let lowerBMR = document.getElementById('lower-bmr-range');
    lowerBMR.innerText = lowerRange;
    let upperBMR = document.getElementById('higher-bmr-range');
    upperBMR.innerText = upperRange;
    let progressBar = document.getElementById('progress-bar-id');
    progressBar.max = average;
}

function updateProgressBar(){

    let calorieElements = document.getElementsByTagName('strong');
    let calorieTotal = 0;
    for (let i=0; i< calorieElements.length; i++){
        calorieTotal = calorieTotal + parseInt(calorieElements[i].innerText);
    }
    let progressBar = document.getElementById('progress-bar-id');
    progressBar.value = calorieTotal;

}

function deleteEntry(mealID){
    let deletedListItem = document.querySelector(`li[data-id="${1}"]`)
    console.log(deletedListItem);
    deletedListItem.remove();
}

function deleteMeal(mealID){
    document.querySelector(`li[data-id="${mealID}"]`).remove();
}

function editMeal(meal){
    let editedCalories = document.querySelector(`strong[data-id="${meal.id}"]`);
    let editedNote = document.querySelector(`em[data-id="${meal.id}"]`)
    editedCalories.innerText = meal.calorie;
    editedNote.innerText = meal.note;
    updateProgressBar();
}

function fetchDatabase(){

    fetch(calorieEntriesDB).then(response => response.json())
        .then(calorieEntries => calorieEntries.forEach(meal => renderMeal(meal)));

}

function renderMeal(meal){
    let mealContainer = caloriesList();
    let caloriesListItem = document.createElement('li');
    caloriesListItem.className = 'calories-list-item';
    caloriesListItem.dataset.id = meal.id;
    caloriesListItem.innerHTML = `
        <div class='uk-grid'>
            <div class='uk-width-1-6'>
            <strong data-id=${meal.id}>${meal.calorie}</strong>
            <span>kcal</span>
            </div>
            <div class='uk-width-4-5'>
                <em class='uk-test-meta' data-id=${meal.id}>
                    ${meal.note}
                </em>
            </div>
        </div>
        <div class='list-item-menu'>

        <a class="edit-button uk-icon" uk-icon="icon: pencil" uk-toggle="target: #edit-form-container" data-id=${meal.id}><svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" data-svg="pencil" data-id=${meal.id}><path data-id=${meal.id} fill="none" stroke="#000" d="M17.25,6.01 L7.12,16.1 L3.82,17.2 L5.02,13.9 L15.12,3.88 C15.71,3.29 16.66,3.29 17.25,3.88 C17.83,4.47 17.83,5.42 17.25,6.01 L17.25,6.01 Z"></path><path data-id=${meal.id} fill="none" stroke="#000" d="M15.98,7.268 L13.851,5.148"></path></svg></a>
        <div class='trash-div' data-id=${meal.id}>
        <a class="delete-button uk-icon" uk-icon="icon: trash" data-id=${meal.id}><svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" data-svg="trash" data-id=${meal.id}><polyline fill="none" stroke="#000" points="6.5 3 6.5 1.5 13.5 1.5 13.5 3"></polyline><polyline fill="none" stroke="#000" points="4.5 4 4.5 18.5 15.5 18.5 15.5 4"></polyline><rect x="8" y="7" width="1" height="9"></rect><rect x="11" y="7" width="1" height="9"></rect><rect x="2" y="3" width="16" height="1"></rect></svg></a>
        <div>
        </div>
    `

    mealContainer.append(caloriesListItem);
    updateProgressBar();
}

function caloriesList(){

    return document.getElementById('calories-list');
}