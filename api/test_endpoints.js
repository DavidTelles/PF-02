(async () => {
  // Test script for API endpoints
  // Uses global fetch if available (Node 18+), otherwise tries to require node-fetch.
  let fetchFn = global.fetch;
  if (!fetchFn) {
    try {
      fetchFn = (...args) => import('node-fetch').then(m => m.default(...args));
    } catch (e) {
      console.error('fetch not available and node-fetch could not be imported');
      process.exit(1);
    }
  }

  const base = 'http://localhost:3002';
  const log = (title, data) => {
    console.log('\n=== ' + title + ' ===');
    try { console.log(JSON.stringify(data, null, 2)); } catch(e) { console.log(data); }
  };

  try {
    // Root
    let res = await fetchFn(base + '/');
    log('GET / status', res.status);
    const rootText = await res.text();
    log('GET / body', rootText);

    // GET users (should return array)
    res = await fetchFn(base + '/users');
    let json = await res.json();
    log('GET /users', json);

    // Create team
    res = await fetchFn(base + '/teams/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Team Test', country: 'Brazil' }) });
    json = await res.json();
    log('POST /teams/create', json);
    const teamId = json.id || 1;

    // List teams
    res = await fetchFn(base + '/teams');
    json = await res.json();
    log('GET /teams', json);

    // Create user
    res = await fetchFn(base + '/users/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'apitester', email: 'apitester@example.com', password: 'secret123' }) });
    json = await res.json();
    log('POST /users/create', json);
    const userId = json.id;

    // Login
    res = await fetchFn(base + '/users/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'apitester', password: 'secret123' }) });
    json = await res.json();
    log('POST /users/login', json);
    const token = json.token;

    // Profile with token
    res = await fetchFn(base + '/users/perfil', { headers: { Authorization: 'Bearer ' + token } });
    json = await res.json();
    log('GET /users/perfil', json);

    // Create runner
    res = await fetchFn(base + '/runners/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Runner Test', team: teamId }) });
    json = await res.json();
    log('POST /runners/create', json);
    const runnerId = json.id;

    // List runners
    res = await fetchFn(base + '/runners');
    json = await res.json();
    log('GET /runners', json);

    // Edit runner
    res = await fetchFn(base + '/runners/edit?id=' + runnerId, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Runner Edited', team: teamId }) });
    json = await res.json();
    log('PUT /runners/edit', json);


    // --- Test voltas endpoints ---
    // Create lap/volta (requires token and runnerId)
    if (runnerId) {
      res = await fetchFn(base + '/voltas', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ corredores_id: runnerId, tempo: 12.34, data: new Date().toISOString() }) });
      json = await res.json();
      log('POST /voltas', json);

      // Get contagem por corredor
      res = await fetchFn(base + '/voltas/contagem/' + runnerId, { headers: { Authorization: 'Bearer ' + token } });
      json = await res.json();
      log('GET /voltas/contagem/:id', json);

      // Get melhor volta por corredor
      res = await fetchFn(base + '/voltas/melhor/' + runnerId, { headers: { Authorization: 'Bearer ' + token } });
      json = await res.json();
      log('GET /voltas/melhor/:id', json);
    }

    // Delete runner
    res = await fetchFn(base + '/runners/delete?id=' + runnerId, { method: 'DELETE' });
    json = await res.json();
    log('DELETE /runners/delete', json);

    // Edit team
    res = await fetchFn(base + '/teams/edit?id=' + teamId, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Team Test Edited', country: 'Brazil' }) });
    json = await res.json();
    log('PUT /teams/edit', json);

    // Delete team
    res = await fetchFn(base + '/teams/delete?id=' + teamId, { method: 'DELETE' });
    json = await res.json();
    log('DELETE /teams/delete', json);

    // Delete user
    res = await fetchFn(base + '/users/delete?id=' + userId, { method: 'DELETE' });
    json = await res.json();
    log('DELETE /users/delete', json);

    console.log('\nAll tests executed.');
  } catch (err) {
    console.error('Error during tests:', err);
    process.exit(1);
  }
})();
