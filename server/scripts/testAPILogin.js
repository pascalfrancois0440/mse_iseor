const axios = require('axios');

async function testAPILogin() {
  try {
    console.log('🧪 Test de l\'API de connexion...\n');

    const baseURL = 'http://localhost:5000';

    // Test 1: Connexion administrateur
    console.log('1️⃣ Test connexion administrateur...');
    try {
      const adminResponse = await axios.post(`${baseURL}/api/auth/login`, {
        email: 'admin@mse-diagnostic.fr',
        password: 'Admin123!'
      });

      if (adminResponse.status === 200) {
        console.log('✅ Connexion administrateur réussie');
        console.log(`   Token reçu: ${adminResponse.data.token ? 'Oui' : 'Non'}`);
        console.log(`   Utilisateur: ${adminResponse.data.user?.prenom} ${adminResponse.data.user?.nom}`);
        console.log(`   Rôle: ${adminResponse.data.user?.role}`);
      }
    } catch (error) {
      console.log('❌ Erreur connexion administrateur:');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Message: ${error.response?.data?.message || error.message}`);
    }

    // Test 2: Connexion consultant
    console.log('\n2️⃣ Test connexion consultant...');
    try {
      const consultantResponse = await axios.post(`${baseURL}/api/auth/login`, {
        email: 'consultant@mse-diagnostic.fr',
        password: 'Consultant123!'
      });

      if (consultantResponse.status === 200) {
        console.log('✅ Connexion consultant réussie');
        console.log(`   Token reçu: ${consultantResponse.data.token ? 'Oui' : 'Non'}`);
        console.log(`   Utilisateur: ${consultantResponse.data.user?.prenom} ${consultantResponse.data.user?.nom}`);
        console.log(`   Rôle: ${consultantResponse.data.user?.role}`);
      }
    } catch (error) {
      console.log('❌ Erreur connexion consultant:');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Message: ${error.response?.data?.message || error.message}`);
    }

    // Test 3: Connexion avec mauvais mot de passe
    console.log('\n3️⃣ Test avec mauvais mot de passe...');
    try {
      await axios.post(`${baseURL}/api/auth/login`, {
        email: 'admin@mse-diagnostic.fr',
        password: 'MauvaisMotDePasse'
      });
      console.log('❌ ERREUR: La connexion avec un mauvais mot de passe a réussi !');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Rejet correct du mauvais mot de passe');
      } else {
        console.log(`❌ Erreur inattendue: ${error.response?.status} - ${error.response?.data?.message}`);
      }
    }

    // Test 4: Vérification de l'état du serveur
    console.log('\n4️⃣ Test état du serveur...');
    try {
      const healthResponse = await axios.get(`${baseURL}/api/auth/profile`, {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });
      console.log('❌ ERREUR: Accès autorisé avec token invalide !');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Serveur fonctionne et sécurisé (rejet token invalide)');
      } else {
        console.log(`❌ Erreur serveur: ${error.response?.status} - ${error.message}`);
      }
    }

    console.log('\n🎉 Tests API terminés !');

  } catch (error) {
    console.error('❌ Erreur générale lors des tests :', error.message);
  }
}

// Attendre un peu que le serveur soit complètement démarré
setTimeout(testAPILogin, 2000);
