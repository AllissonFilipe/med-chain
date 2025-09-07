// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/**
 * @title BadgeRepositoryMulti
 * @dev Contrato para que usuários possam receber múltiplas badges únicas por título.
 * Apenas o proprietário do contrato pode emitir novas badges.
 */
contract HatRepository {

    address public owner;

    enum DocumentType {
        EXAM,
        REPORT,
        REVENUE,
        OTHER
    }

    struct Document {
        string docName;
        string ipfsAddress;
        uint256 creationDate;
        DocumentType docType;
        bool emitida; // Flag para verificar existência de forma mais barata
    }

    // Mapeamento aninhado: endereço do receiverAddress -> título da badge -> struct da Badge
    mapping(address => mapping(string => Document)) public documents;

    // Mapeamento para armazenar a lista de títulos de badges de cada usuário
    mapping(address => string[]) private documentNames;

    event RegisteredDocument(
        address indexed receiverAddress,
        string docName,
        DocumentType indexed docType
    );

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Acao restrita ao proprietario do contrato.");
        _;
    }

    /**
     * @dev Registra uma nova badge para um usuário, desde que ele já não possua uma com o mesmo título.
     * @param _receiverAddress O endereço que receberá a badge.
     * @param _docName O título único da badge (usado como ID).
     * @param _ipfsAddress Uma descrição detalhada da conquista.
     * @param _docType O tipo de badge.
     */
    function registerDocument(
        address _receiverAddress,
        string memory _docName,
        string memory _ipfsAddress,
        DocumentType _docType
    ) public onlyOwner {
        require(!documents[_receiverAddress][_docName].emitida, "O usuario ja possui uma badge com este titulo.");
        require(bytes(_docName).length > 0, "O titulo nao pode ser vazio.");

        documents[_receiverAddress][_docName] = Document({
            docName: _docName,
            ipfsAddress: _ipfsAddress,
            creationDate: block.timestamp,
            docType: _docType,
            emitida: true
        });

        // Adiciona o título à lista de badges do usuário
        documentNames[_receiverAddress].push(_docName);

        emit RegisteredDocument(_receiverAddress, _docName, _docType);
    }

    /**
     * @dev Retorna os detalhes de uma badge específica de um usuário.
     * @param _receiverAddress O endereço do proprietário da badge.
     * @param _docName O título da badge a ser consultada.
     * @return A struct com as informações da badge.
     */
    function getBadgePorTitulo(address _receiverAddress, string memory _docName) public view returns (Document memory) {
        require(documents[_receiverAddress][_docName].emitida, "Badge nao encontrada para este usuario e titulo.");
        return documents[_receiverAddress][_docName];
    }

    /**
     * @dev Retorna a lista de títulos de todas as badges que um usuário possui.
     * @param _receiverAddress O endereço do usuário.
     * @return Um array de strings com os títulos das badges.
     */
    function getTitulosDasBadgesDoUsuario(address _receiverAddress) public view returns (string[] memory) {
        return documentNames[_receiverAddress];
    }

    /**
     * @dev Retorna a quantidade de badges que um usuário possui.
     * @param _receiverAddress O endereço do usuário.
     * @return O número de badges.
     */
    function getContagemDeBadges(address _receiverAddress) public view returns (uint256) {
        return documentNames[_receiverAddress].length;
    }
}