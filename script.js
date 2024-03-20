const allPlayersTBody = document.querySelector("#allPlayers tbody")
const searchPlayer = document.getElementById("searchPlayer")
const btnAdd = document.getElementById("btnAdd")
const closeDialog = document.getElementById("closeDialog")
const pager = document.getElementById('pager')

let currentQ = ""
let currentSortCol = "name"
let currentSortOrder = ""
let currentPageNo = 1
let currentPageSize = 20
const sortArrows = document.getElementsByClassName("bi");

Object.values(sortArrows).forEach(link => {
    link.addEventListener("click", () => {
        currentSortCol = link.dataset.sortcol
        currentSortOrder = link.dataset.sortorder
        updateTable()
    })
})

function Player(id, name, jersey, team, position) {
    this.id = id
    this.name = name
    this.jersey = jersey
    this.team = team
    this.position = position
    this.visible = true
    this.matches = function (searchFor) {
        return this.name.toLowerCase().includes(searchFor) ||
            this.position.toLowerCase().includes(searchFor) ||
            this.team.toLowerCase().includes(searchFor)
    }
}


searchPlayer.addEventListener("input", function () {
    setTimeout(() => {
        currentPageNo = 1
        currentQ = searchPlayer.value.toLowerCase()
        updateTable()
    }, 1000);

});


const createTableTdOrTh = function (elementType, innerText) {
    let element = document.createElement(elementType)
    element.textContent = innerText
    return element
}


const playerName = document.getElementById("playerName")
const jersey = document.getElementById("jersey")
const position = document.getElementById("position")

let editingPlayer = null

closeDialog.addEventListener("click", async (ev) => {
    ev.preventDefault()
    let url = ""
    let method = ""
    var o = {
        "name": playerName.value,
        "jersey": jersey.value,
        "position": position.value,
        "team": team.value
    }


    // Rest of the code...
    //validator.isString(o.name);

    if (editingPlayer != null) {
        o.id = editingPlayer.id;
        url = "http://localhost:3000/updatePlayer/" + o.id
        method = "PUT"
    } else {
        switch (true) {
            case validator.isEmpty(o.name):
                alert("The name cannot be empty!");
                break;
            case validator.isEmpty(o.jersey) && !validator.isNumeric(o.jersey):
                alert("The jersey cannot be empty or a string!");
                break;
            case validator.isEmpty(o.position):
                alert("The position cannot be empty!");
                break;
            case validator.isEmpty(o.team):
                alert("The team cannot be empty!");
                break;
            
            default:
                url = "http://localhost:3000/createPlayer"
                method = "POST"
                break;
        }
        
    
    }
    let response = await fetch(url, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: method,
        body: JSON.stringify(o)
    })

    window.location.reload();


    //MAC MASS COMMENT COMMAND + K + C
    // let json = await response.json()

    // players = await fetchPlayers()
    // updateTable()
    // MicroModal.close('modal-1');
})

btnAdd.addEventListener("click", () => {
    playerName.value = ""
    jersey.value = 0
    position.value = ""
    editingPlayer = null

    MicroModal.show('modal-1');

})

async function fetchPlayers() {
    let offset = (currentPageNo - 1) * currentPageSize
    return ((await fetch('http://localhost:3000/getPlayers?' 
    + '&sortCol=' + currentSortCol 
    + '&sortOrder=' + currentSortOrder 
    + '&q=' + currentQ  
    + "&limit=" + currentPageSize 
    + "&offset=" + offset
    )).json())
}

function createPager(count, pageNo, currentPageSize) {
    pager.innerHTML = ""
    let totalPages = Math.ceil(count / currentPageSize)
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li')
        li.classList.add("page-item")
        if (i == pageNo) {
            li.classList.add("active")
        }
        const a = document.createElement('a')
        a.href = "#"
        a.innerText = i
        a.classList.add("page-link")
        li.appendChild(a)
        a.addEventListener("click", () => {
            currentPageNo = i
            updateTable()
        })
        pager.appendChild(li)
    }
}

const updateTable = async function () {
    let data = await fetchPlayers()
    createPager(data.count, currentPageNo, currentPageSize)
    // while(allPlayersTBody.firstChild)
    //     allPlayersTBody.firstChild.remove()
    allPlayersTBody.innerHTML = ""
    // först ta bort alla children
    let antal = data.rows.length;
    //if(data.count < currentPageSize) {antal = data.count}

    for (let i = 0; i < antal; i++) { // hrmmm you do foreach if you'd like, much nicer! 
        let tr = document.createElement("tr")

        tr.appendChild(createTableTdOrTh("th", data.rows[i].name))
        tr.appendChild(createTableTdOrTh("td", data.rows[i].jersey))
        tr.appendChild(createTableTdOrTh("td", data.rows[i].position))
        tr.appendChild(createTableTdOrTh("td", data.rows[i].team))

        let td = document.createElement("td")
        let btn = document.createElement("button")
        let btnDelete = document.createElement("button")
        btnDelete.textContent = "DELETE"
        btn.textContent = "EDIT"
        btn.dataset.stefansplayerid = data.rows[i].id

        td.appendChild(btnDelete)
        td.appendChild(btn)
        tr.appendChild(td)




        btn.addEventListener("click", function () {
            playerName.value = data.rows[i].name
            jersey.value = data.rows[i].jersey
            position.value = data.rows[i].position
            team.value = data.rows[i].team
            editingPlayer = data.rows[i]
            MicroModal.show('modal-1');

        })

        btnDelete.addEventListener("click", async function () {
            if (confirm("Are you sure you want to delete " + data.rows[i].name + "?")) {
                await fetch("http://localhost:3000/deletePlayer/" + data.rows[i].id, {
                    method: "DELETE"
                })
                window.location.reload();
            }

        })


        allPlayersTBody.appendChild(tr)
    }
    

    // innerHTML och backticks `
    // Problem - aldrig bra att bygga strängar som innehåller/kan innehålla html
    //    injection
    // for(let i = 0; i < players.length;i++) { // hrmmm you do foreach if you'd like, much nicer! 
    //                                         // I will show you in two weeks
    //                                         //  or for p of players     
    //     let trText = `<tr><th scope="row">${players[i].name}</th><td>${players[i].jersey}</td><td>${players[i].position}</td><td>${players[i].team}</td></tr>`
    //     allPlayersTBody.innerHTML += trText
    // }
    // createElement
}



await updateTable()





MicroModal.init({
    onShow: modal => console.info(`${modal.id} is shown`), // [1]
    onClose: modal => console.info(`${modal.id} is hidden`), // [2]

    openTrigger: 'data-custom-open', // [3]
    closeTrigger: 'data-custom-close', // [4]
    openClass: 'is-open', // [5]
    disableScroll: true, // [6]
    disableFocus: false, // [7]
    awaitOpenAnimation: false, // [8]
    awaitCloseAnimation: false, // [9]
    debugMode: true // [10]
});





