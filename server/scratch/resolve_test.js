const dns = require('dns');

const candidates = [
  'uixiupweqbdggjlwaiqu.supabase.co',
  'uixjupweqbdggjlwaiqu.supabase.co',
  'uixiupweqbggjlwaiqu.supabase.co',
  'uixjupweqbggjlwaiqu.supabase.co',
  'uixiupweqbdggjlwalqu.supabase.co',
  'uixjupweqbdggjlwalqu.supabase.co'
];

candidates.forEach(host => {
  dns.lookup(host, (err, address, family) => {
    if (err) {
      console.log(`❌ ${host}: Failed (${err.code})`);
    } else {
      console.log(`✅ ${host}: Resolved to ${address}`);
    }
  });
});
