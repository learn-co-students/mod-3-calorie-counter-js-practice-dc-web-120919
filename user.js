document.addEventListener("DOMContentLoaded", (e)=>{

    console.log('user.js connected...');

    document.getElementById('bmr-submit-button').addEventListener('click', (e) => saveUserToDB(e))
})


function saveUserToDB(event){

    let userHash = calculateBMR(event);
    console.log(`Hash from user.js: ${userHash}`);
}

