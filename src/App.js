import React from 'react';
import './App.css';

class App extends React.Component {
    constructor() {
        super();
        this.state = {
            theWords: null
        }
        this.chooseWords = this.chooseWords.bind(this);
    }

    componentDidMount() {
        this.chooseWords()
    }

    chooseWords() {
        let wordArray = []
        for (let i=0; i<25; i++) wordArray[i] = "word" + i
        this.setState({theWords: wordArray})
    }

    displayCards() {
        if (!this.state.theWords) return
        let theRows = []
        let theColumns = []
        for (let i=0; i<5; i++) {
            theColumns[i] = []
            for (let j=0; j<5; j++) {
                theColumns[i][j] = (
                    <div id={"box-" + (5*i + j)} key={5*i + j} className="box">
                        {this.state.theWords[5*i + j]}
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

    render() {
        return (
            <div id="main">
                {this.displayCards()}
            </div>
        )
    }
}

export default App;
