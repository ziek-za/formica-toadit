CONST_PROVINCES = [
	{ value: 'Eastern Cape', _id: 'ec' },
	{ value: 'Free State', _id: 'fs' },
	{ value: 'Gauteng', _id: 'gt' },
	{ value: 'KwaZulu-Natal', _id: 'kzn' },
	{ value: 'Limpopo', _id: 'lmp'},
	{ value: 'Mpumalanga', _id: 'mpm'},
	{ value: 'North West', _id: 'nw'},
	{ value: 'Northern Cape', _id: 'nc'},
	{ value: 'Western Cape', _id: 'wc'}
];

PROVINCES = function() {
	var provinces = [];
	for (i = 0; i < CONST_PROVINCES.length; i++) {
		provinces.push(CONST_PROVINCES[i].value);
	}
	return provinces;
}