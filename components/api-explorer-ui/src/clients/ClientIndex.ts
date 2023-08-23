import BoardGamesApiClient from './BoardGamesAPIClient'

export default class ClientIndex {
  boardGamesApi: BoardGamesApiClient

  constructor () {
    this.boardGamesApi = new BoardGamesApiClient()
  }

  get index (): { [key: string]: any } {
    return {
      'board-games-api': this.boardGamesApi
    }
  }
}
