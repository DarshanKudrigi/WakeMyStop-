

export const CITY_ALIASES = {
  bangalore: { official: 'bengaluru', aliasName: 'Bangalore', codes: ['sbc', 'smvb', 'bnc', 'yjpr'] },
  bengaluru: { official: 'bengaluru', aliasName: 'Bangalore', codes: ['sbc', 'smvb', 'bnc', 'yjpr'] },

  mysore: { official: 'mysuru', aliasName: 'Mysore', codes: ['mys', 'myx'] },
  mysuru: { official: 'mysuru', aliasName: 'Mysore', codes: ['mys', 'myx'] },

  bombay: { official: 'mumbai', aliasName: 'Bombay', codes: ['csmt', 'mmct', 'dr', 'bdts', 'ltt', 'cla'] },
  mumbai: { official: 'mumbai', aliasName: 'Bombay', codes: ['csmt', 'mmct', 'dr', 'bdts', 'ltt', 'cla'] },

  calcutta: { official: 'kolkata', aliasName: 'Calcutta', codes: ['hwh', 'sdah', 'koaa', 'shm'] },
  kolkata: { official: 'kolkata', aliasName: 'Calcutta', codes: ['hwh', 'sdah', 'koaa', 'shm'] },

  madras: { official: 'chennai', aliasName: 'Madras', codes: ['mas', 'ms', 'tbm', 'per'] },
  chennai: { official: 'chennai', aliasName: 'Madras', codes: ['mas', 'ms', 'tbm', 'per'] },

  trivandrum: { official: 'thiruvananthapuram', aliasName: 'Trivandrum', codes: ['tvc', 'tvp'] },
  thiruvananthapuram: { official: 'thiruvananthapuram', aliasName: 'Trivandrum', codes: ['tvc', 'tvp'] },

  benares: { official: 'varanasi', aliasName: 'Varanasi', codes: ['bsb', 'bsbs', 'ddu'] },
  banaras: { official: 'varanasi', aliasName: 'Banaras', codes: ['bsb', 'bsbs', 'ddu'] },

  cochin: { official: 'kochi', aliasName: 'Cochin', codes: ['ers', 'ern'] },
  kochi: { official: 'kochi', aliasName: 'Cochin', codes: ['ers', 'ern'] },
  ernakulam: { official: 'kochi', aliasName: 'Ernakulam', codes: ['ers', 'ern'] },

  gurgaon: { official: 'gurugram', aliasName: 'Gurgaon', codes: ['ggn'] },
  gurugram: { official: 'gurugram', aliasName: 'Gurgaon', codes: ['ggn'] },

  calicut: { official: 'kozhikode', aliasName: 'Calicut', codes: ['clt'] },
  kozhikode: { official: 'kozhikode', aliasName: 'Calicut', codes: ['clt'] },

  mangalore: { official: 'mangaluru', aliasName: 'Mangalore', codes: ['maq', 'majn'] },
  mangaluru: { official: 'mangaluru', aliasName: 'Mangalore', codes: ['maq', 'majn'] },

  trichy: { official: 'tiruchchirappalli', aliasName: 'Trichy', codes: ['tpj'] },
  tiruchirappalli: { official: 'tiruchchirappalli', aliasName: 'Trichy', codes: ['tpj'] },

  pondicherry: { official: 'puducherry', aliasName: 'Pondicherry', codes: ['pdy'] },
  puducherry: { official: 'puducherry', aliasName: 'Pondicherry', codes: ['pdy'] },

  gauhati: { official: 'guwahati', aliasName: 'Gauhati', codes: ['ghy', 'kyq'] },
  guwahati: { official: 'guwahati', aliasName: 'Gauhati', codes: ['ghy', 'kyq'] },

  simla: { official: 'shimla', aliasName: 'Simla', codes: ['sml'] },
  shimla: { official: 'shimla', aliasName: 'Simla', codes: ['sml'] },

  baroda: { official: 'vadodara', aliasName: 'Baroda', codes: ['brc'] },
  vadodara: { official: 'vadodara', aliasName: 'Baroda', codes: ['brc'] },

  poona: { official: 'pune', aliasName: 'Poona', codes: ['pune'] },
  pune: { official: 'pune', aliasName: 'Poona', codes: ['pune'] },

  waltair: { official: 'visakhapatnam', aliasName: 'Waltair', codes: ['vskp'] },
  vizag: { official: 'visakhapatnam', aliasName: 'Vizag', codes: ['vskp'] },
  visakhapatnam: { official: 'visakhapatnam', aliasName: 'Vizag', codes: ['vskp'] },
}

/**
 * Returns alias metadata if search token matches an alias entry
 */
export function getCityAliasInfo(query) {
  if (!query) return null
  const q = query.trim().toLowerCase()
  return CITY_ALIASES[q] || null
}
