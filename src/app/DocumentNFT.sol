// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// === IMPORTAÇÕES DIRETAS DO OPENZEPPELIN VIA GITHUB RAW ===
import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/v5.0.2/contracts/token/ERC721/ERC721.sol";

/**
 * @title DocumentNFT
 * @dev ERC721 com metadados de documentos, tokenId auto-increment e verificação manual de existência.
 */
contract DocumentNFT is ERC721 {
    // Contador interno que armazena o último tokenId gerado
    uint256 private _currentTokenId;

    // Estrutura que armazena os metadados de cada documento NFT
    struct Document {
        string docName;      // Nome do documento
        string description;  // Descrição do documento
        string ipfsAddress;  // Endereço IPFS do arquivo do documento
        uint256 docType;     // Tipo do documento (pode ser usado para categorizar)
    }

    // Mapeamento que relaciona tokenId aos metadados do documento
    mapping(uint256 => Document) private _documents;

    // Mapeamento que indica se um token já foi mintado (existe)
    mapping(uint256 => bool) private _mintedTokens;

    // Evento emitido quando um novo documento NFT é criado
    event DocumentCreated(uint256 indexed tokenId, string docName, uint256 docType, string ipfsAddress);

    /**
     * @dev Construtor do contrato.
     * @param name_ Nome da coleção NFT.
     * @param symbol_ Símbolo da coleção NFT.
     */
    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {}

    /**
     * @dev Cria (mint) um novo NFT de documento.
     * O tokenId é gerado automaticamente de forma incremental.
     * @param to Endereço que receberá o NFT.
     * @param docName Nome do documento.
     * @param description Descrição do documento.
     * @param ipfsAddress Endereço IPFS do arquivo do documento.
     * @param docType Tipo do documento.
     * @return tokenId ID do token recém-criado.
     */
    function mint(
        address to,
        string memory docName,
        string memory description,
        string memory ipfsAddress,
        uint256 docType
    ) public returns (uint256) {
        // Incrementa o contador de tokenId
        _currentTokenId += 1;
        uint256 tokenId = _currentTokenId;

        // Mint do NFT para o endereço "to"
        _mint(to, tokenId);

        // Armazena os metadados do documento
        _documents[tokenId] = Document(docName, description, ipfsAddress, docType);

        // Marca o token como existente
        _mintedTokens[tokenId] = true;

        // Emite evento de criação do documento
        emit DocumentCreated(tokenId, docName, docType, ipfsAddress);

        return tokenId;
    }

    /**
     * @dev Função interna que verifica manualmente se um token existe.
     * @param tokenId ID do token a ser verificado.
     * @return bool true se o token existe, false caso contrário.
     */
    function _existsManual(uint256 tokenId) internal view returns (bool) {
        return _mintedTokens[tokenId];
    }

    /**
     * @dev Retorna os metadados de um documento NFT existente.
     * @param tokenId ID do token que se deseja consultar.
     * @return Document Estrutura contendo os metadados do documento.
     */
    function getDocument(uint256 tokenId) public view returns (Document memory) {
        require(_existsManual(tokenId), "Token inexistente");
        return _documents[tokenId];
    }

    /**
     * @dev Retorna o tokenURI (IPFS) do NFT, usado por wallets e Etherscan.
     * @param tokenId ID do token que se deseja consultar.
     * @return string Endereço IPFS do documento.
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_existsManual(tokenId), "Token inexistente");
        return _documents[tokenId].ipfsAddress;
    }

    /**
     * @dev Retorna o próximo tokenId que será usado no mint.
     * Útil para exibir no frontend qual será o próximo NFT.
     * @return uint256 Próximo tokenId.
     */
    function getNextTokenId() public view returns (uint256) {
        return _currentTokenId + 1;
    }
}