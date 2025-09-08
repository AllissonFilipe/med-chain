// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/**
 * @title MedicalDocumentRepository
 * @dev Contrato para que usuários possam receber múltiplos documentos médicos.
 * Apenas o proprietário do contrato pode emitir novos documentos.
 */
contract MedicalDocumentRepository {

    address public owner;

    enum DocumentType {
        EXAM,
        REPORT,
        REVENUE,
        OTHER
    }

    struct Document {
        string docName;
        string description;
        string ipfsAddress;
        uint256 creationDate;
        DocumentType docType;
        bool emitida; // Flag para verificar existência de forma mais barata
    }

    // Mapeamento aninhado: endereço do paciente -> título do documento -> struct do Documento
    mapping(address => mapping(string => Document)) public documents;

    // Mapeamento para armazenar a lista de títulos de documentos de cada paciente
    mapping(address => string[]) private documentNames;

    event RegisteredDocument(
        address indexed receiverAddress,
        string docName,
        string description,
        string ipfsAddress,
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
     * @dev Registra um novo documento médico para um paciente, desde que ele já não possua um com o mesmo título.
     * @param _receiverAddress O endereço do paciente que receberá o documento.
     * @param _docName O título único do documento (usado como ID).
     * @param _ipfsAddress Endereço IPFS onde o documento está armazenado.
     * @param _docType O tipo de documento.
     */
    function registerDocument(
        address _receiverAddress,
        string memory _docName,
        string memory _description,
        string memory _ipfsAddress,
        DocumentType _docType
    ) public onlyOwner {
        require(!documents[_receiverAddress][_docName].emitida, "O paciente ja possui um documento com este titulo.");
        require(bytes(_docName).length > 0, "O titulo nao pode ser vazio.");

        documents[_receiverAddress][_docName] = Document({
            docName: _docName,
            description: _description,
            ipfsAddress: _ipfsAddress,
            creationDate: block.timestamp,
            docType: _docType,
            emitida: true
        });

        // Adiciona o título à lista de documentos do paciente
        documentNames[_receiverAddress].push(_docName);

        emit RegisteredDocument(_receiverAddress, _docName, _description, _ipfsAddress, _docType);
    }

    /**
     * @dev Retorna os detalhes de um documento específico de um paciente.
     * @param _receiverAddress O endereço do paciente.
     * @param _docName O título do documento a ser consultado.
     * @return A struct com as informações do documento.
     */
    function getDocumentByTitle(address _receiverAddress, string memory _docName) public view returns (Document memory) {
        require(documents[_receiverAddress][_docName].emitida, "Documento nao encontrado para este paciente e titulo.");
        return documents[_receiverAddress][_docName];
    }

    /**
     * @dev Retorna a lista de títulos de todos os documentos que um paciente possui.
     * @param _receiverAddress O endereço do paciente.
     * @return Um array de strings com os títulos dos documentos.
     */
    function getAllDocumentTitles(address _receiverAddress) public view returns (string[] memory) {
        return documentNames[_receiverAddress];
    }

    /**
     * @dev Retorna a quantidade de documentos que um paciente possui.
     * @param _receiverAddress O endereço do paciente.
     * @return O número de documentos.
     */
    function getDocumentCount(address _receiverAddress) public view returns (uint256) {
        return documentNames[_receiverAddress].length;
    }
}