import React from 'react';
import './App.css';

class App extends React.Component {
    constructor() {
        super();
        this.state = {
            theCards: null,
            games: null,
            currentGame: null,
            checkedGamesRecently: true,
            creatingGame: false,
            clientType: null
        }
        this.newGameMenu = this.newGameMenu.bind(this);
        this.createGame = this.createGame.bind(this);
        this.joinGame = this.joinGame.bind(this);
        this.setClientType = this.setClientType.bind(this);

        this.gameName = React.createRef()
    }

    componentDidMount() {
        this.getGames()
    }

    componentDidUpdate() {
        if (!this.state.checkedGamesRecently && !this.state.currentGame) {
            this.setState({checkedGamesRecently: true})
            this.getGames()
        }
    }

    setCards() {
        let wordArray = [] //choose words placeholder. should choose random nouns to fill 25 slots
        for (let i=0; i<25; i++) wordArray[i] = "word" + i

        let unchosenCards = makeCountArray(25) //basis for choosing red, blue, and death cards
        let blueCards = []
        for (let i=0; i<9; i++) {
            let chosenIndex = randomInteger(0, unchosenCards.length - 1)
            blueCards.push(unchosenCards[chosenIndex])
            unchosenCards = deleteAtIndex(unchosenCards, chosenIndex)
        }
        let redCards = []
        for (let i=0; i<8; i++) {
            let chosenIndex = randomInteger(0, unchosenCards.length - 1)
            redCards.push(unchosenCards[chosenIndex])
            unchosenCards = deleteAtIndex(unchosenCards, chosenIndex)
        }
        let deathCardIndex = randomInteger(0, unchosenCards.length - 1)
        let deathCard = unchosenCards[deathCardIndex]
        unchosenCards = deleteAtIndex(unchosenCards, deathCardIndex)

        return {
            words: wordArray,
            blueCards: blueCards,
            redCards: redCards,
            deathCard: deathCard,
            neutralCards: unchosenCards
        }
    }

    displayCards() {
        if (!this.state.theCards) return null
        let theRows = []
        let theColumns = []
        for (let i=0; i<5; i++) {
            theColumns[i] = []
            for (let j=0; j<5; j++) {
                theColumns[i][j] = (
                    <div id={"box-" + (5*i + j)} key={5*i + j} className="box">
                        {this.state.theCards.words[5*i + j]}
                    </div>
                )
            }
            theRows[i] = <div id={"row-" + i} key={i} className="row">{theColumns[i]}</div>
        }
        return(
            <div id="the-boxes">
                {theRows}
            </div>
        )
    }

    displayJoinScreen() {
        return (
            <div id="join-screen">
                <h1>Choose your role</h1>
                <div id="guesser" onClick={this.setClientType}>
                    <h2>Guesser</h2>
                </div>
                <div id="cluer" onClick={this.setClientType}>
                    <h2>Clue giver</h2>
                </div>
            </div>
        )
    }

    displayGames() {
        if (this.state.games) {
            let gamesArray = this.state.games
            let games = []
            for (let i=0; i<gamesArray.length; i++) {
                games.push(
                    <div key={i} className="game">
                        <label>Game #{gamesArray[i].num}: {gamesArray[i].name}</label>
                        <button id={`join-${i}`} onClick={this.joinGame}>join</button>
                    </div>
                )
            }
            let createGameWindow = null;
            if (this.state.creatingGame) {
                createGameWindow = [ //maybe add client type options here instead
                    <div id="dim-screen" key="0">
                        <div id="create-menu">
                            <h2>Create new game</h2>
                            <label>Game name: <input type="text" ref={this.gameName}/></label>
                            <div id="create-buttons">
                                <button onClick={this.createGame}>create</button>
                                <button onClick={this.newGameMenu}>cancel</button>
                            </div>
                        </div>
                    </div>
                ]
            }
            return (
                <div id="games">
                    {createGameWindow}
                    <h1>Games</h1>
                    {games}
                    <button onClick={this.newGameMenu}>new game</button>
                </div>
            )
        }
    }

    newGameMenu() {
        this.setState({creatingGame: !this.state.creatingGame})
    }

    async getGames() {
        const response = await fetch("/games"); //should find a way to do this only loading relevant info from games file
        const gamesObj = await response.json();
        setTimeout(() => {this.setState({checkedGamesRecently: false})}, 5000)
        this.setState({games: gamesObj})
    }

    async createGame() {
        const getResponse = await fetch("/games"); //should find a way to do this without loading all games
        const gamesObj = await getResponse.json();
        let gameNum = gamesObj.length //will create problems if >1 users create a game simultaneously.
        let newGameList = gamesObj
        newGameList[gameNum] = {
          "name": this.gameName.current.value,
          "num": gameNum,
          "cards": this.setCards()
        }
        console.log(newGameList[gameNum].cards)
        const postResponse = await fetch("/games",
            {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(newGameList)
            }
        );
        this.joinGame(null, gameNum)
    }

    async joinGame(e, num) {
        const response = await fetch("/games"); //should find a way to do this without loading all games
        const gamesObj = await response.json();
        let gameNum = num
        if (!num && num!==0) {
            gameNum = Number(e.target.id.slice(5, e.target.id.length))
        }
        this.setState({currentGame: gameNum, theCards: gamesObj[gameNum].cards})
    }

    setClientType(e) {
        this.setState({clientType: e.target.id})
    }

    render() {
        if (!this.state.currentGame) {
            return (
                <div id="main">
                    {this.displayGames()}
                </div>
            )
        } else if (!this.state.clientType) {
            return (
                <div id="main">
                    {this.displayJoinScreen()}
                </div>
            )
        } else {
            return (
                <div id="main">
                    {this.displayCards()}
                </div>
            )
        }
    }
}

//-----global functions-------//

function randomInteger(min, max) {
    let range = max - min + 1
    return Math.floor(range*(Math.random())) + min
}

function deleteAtIndex(array, index) { //someArray===["apple", "banana", "cheese"]; deleteAtIndex(someArray, 1) => ["apple", "cheese"]
    if (index>=array.length || index<0) throw ("error", array, index)
    return array.slice(0, index).concat(array.slice(index + 1, array.length))
}

function makeCountArray(length) { //makeCountArray(4) => [0,1,2,3]
    let returnArray = []
    for (let i=0; i<length; i++) returnArray[i] = i
    return returnArray
}

export default App;