import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8080',
  realm: 'soar-master-realm', // замените на ваш Realm
  clientId: 'soar-master', // замените на ID вашего клиента
});

export default keycloak;
