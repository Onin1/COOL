import React from 'react';
import { connect } from 'react-redux';
import { readyUp, disconnect, resetGame  } from '../actions/game_actions';
import { clearPlayers } from '../actions/player_actions';
import { PacmanLoader } from 'react-spinners';
import { withRouter } from 'react-router-dom';

class Lobby extends React.Component {

  handleSubmit(e) {
    e.preventDefault();
    this.props.readyUp();
    this.props.socket.emit('ready');
  }

  handleCancel(e) {
    e.preventDefault();
    this.props.socket.disconnect();
    this.props.resetGame();
    this.props.clearPlayers();
    this.props.history.push("/");
  }

  componentWillReceiveProps(nextProps) {
    if ( nextProps.players.reduce( (a, p) => p.ready && a , true) && nextProps.players.length > 1 ) {
      this.props.history.push("/");
    }
  }

  render() {
    return (
      <div className="lobby">
        <form onSubmit={this.handleSubmit.bind(this)}>
          <ul>
            { this.props.players.map(player =>
              <li key={player.id}>
                <span>{player.name}</span>
                <div>
                  { player.ready ?
                    <i className="fas fa-check"></i> :
                    <PacmanLoader size={ 10 } color={ "#54722f" } />
                  }
                </div>
              </li>
            ) }
          </ul>
          {
            this.props.ready ? (
              <input
                disabled
                type="submit"
                value="Waiting for other players" />
            ) : (
              <input type="submit" value="Ready Up" />
            )
          }
        </form>
        <button className="gray" onClick={this.handleCancel.bind(this)} >Cancel</button>
      </div>
    )
  }
}

const mapStateToProps = ({ game, players }) => ({
  players: Object.values(players),
  socket: game.socket,
  ready: game.ready
});

const mapDispatchToProps = dispatch => ({
  disconnect: () => dispatch(disconnect()),
  resetGame: () => dispatch(resetGame()),
  clearPlayers: () => dispatch(clearPlayers()),
  readyUp: () => dispatch(readyUp()),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Lobby));
