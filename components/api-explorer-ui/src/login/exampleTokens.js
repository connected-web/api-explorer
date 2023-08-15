const validUserAccessToken = {
  payload: {
    sub: 'de1bfdc2-3c11-4eb2-aed0-74c29ed1338f',
    'cognito:groups': ['BoardGamesBrowserAdmins'],
    iss: 'https://cognito-idp.eu-west-2.amazonaws.com/eu-west-2_VBRbzaly6',
    version: 2,
    client_id: '5rgdg0eeeeu043fbfvl12ehrmg',
    origin_jti: 'a42746fc-d73b-4e27-a785-237cf556d31f',
    event_id: '5bd94fb7-3300-47be-82a4-e2a01cb90209',
    token_use: 'access',
    scope: 'openid profile email',
    auth_time: 1690403915,
    exp: 1690407515,
    iat: 1690403915,
    jti: '48a445aa-776a-407d-9388-088ed71119c2',
    username: 'de1bfdc2-3c11-4eb2-aed0-74c29ed1338f'
  },
  groups: 'BoardGamesBrowserAdmins'
}

const validAppAccessToken = {
  payload: {
    sub: '4jflpkjl6c4u6ve18o822ovu1m',
    token_use: 'access',
    scope: 'app-to-app-connected-web-dev/Group',
    auth_time: 1690403598,
    iss: 'https://cognito-idp.eu-west-2.amazonaws.com/eu-west-2_VBRbzaly6',
    exp: 1690407198,
    iat: 1690403598,
    version: 2,
    jti: 'c7c6c654-7075-4e49-ab6c-cbd2d05d2c22',
    client_id: '4jflpkjl6c4u6ve18o822ovu1m'
  },
  groups: ''
}

console.log('Valid user access token:', { validUserAccessToken })
console.log('Valid app access token: ', { validAppAccessToken })
