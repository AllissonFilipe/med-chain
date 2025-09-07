export const ABI_CONTRACT = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_receiverAddress",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "_docName",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_ipfsAddress",
				"type": "string"
			},
			{
				"internalType": "enum HatRepository.DocumentType",
				"name": "_docType",
				"type": "uint8"
			}
		],
		"name": "registerDocument",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "receiverAddress",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "docName",
				"type": "string"
			},
			{
				"indexed": true,
				"internalType": "enum HatRepository.DocumentType",
				"name": "docType",
				"type": "uint8"
			}
		],
		"name": "RegisteredDocument",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "documents",
		"outputs": [
			{
				"internalType": "string",
				"name": "docName",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "ipfsAddress",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "creationDate",
				"type": "uint256"
			},
			{
				"internalType": "enum HatRepository.DocumentType",
				"name": "docType",
				"type": "uint8"
			},
			{
				"internalType": "bool",
				"name": "emitida",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_receiverAddress",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "_docName",
				"type": "string"
			}
		],
		"name": "getBadgePorTitulo",
		"outputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "docName",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "ipfsAddress",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "creationDate",
						"type": "uint256"
					},
					{
						"internalType": "enum HatRepository.DocumentType",
						"name": "docType",
						"type": "uint8"
					},
					{
						"internalType": "bool",
						"name": "emitida",
						"type": "bool"
					}
				],
				"internalType": "struct HatRepository.Document",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_receiverAddress",
				"type": "address"
			}
		],
		"name": "getContagemDeBadges",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_receiverAddress",
				"type": "address"
			}
		],
		"name": "getTitulosDasBadgesDoUsuario",
		"outputs": [
			{
				"internalType": "string[]",
				"name": "",
				"type": "string[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]