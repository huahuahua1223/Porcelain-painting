// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2; //Do not change the solidity version as it negatively impacts submission grading

import "@openzeppelin/contracts/token/ERC721/ERC721.sol"; // 实现 ERC721
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol"; // 实现 ERC721Enumerable
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol"; // 存储 tokenURI
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol"; // 实现 EIP-2981 标准
import "@openzeppelin/contracts/access/Ownable.sol"; // 用于控制合约的权限
import "@openzeppelin/contracts/utils/Counters.sol"; // 用于生成递增的 tokenId
import "@openzeppelin/contracts/security/ReentrancyGuard.sol"; // 防止重入攻击

contract YourCollectible is
	ERC721,
	ERC721Enumerable,
	ERC721URIStorage,
    ERC721Royalty,
	Ownable,
    ReentrancyGuard
{
	using Counters for Counters.Counter;

	Counters.Counter public tokenIdCounter;
	uint256 public listingFee = 0.025 ether; // 上架费用，0.025 eth = 25000000000000000 wei
	
	struct NFTItem {
        uint256 tokenId;
        uint256 price;
        address payable owner;
        bool isListed;
        string tokenUri;
    }

    struct Fraction {
        uint256 amount; // 持有的碎片数量
        bool isForSale;
        uint256 price; // 每个碎片的价格
    }
	
	mapping(uint256 => NFTItem) public nftItems; // 存储每个NFT的信息
	mapping(uint256 => address) public mintedBy; // 保存每个NFT的铸造者
    mapping(uint256 => bool) public isFractionalized; // 记录是否被碎片化
    mapping(uint256 => uint256) public totalFractions; // 每个NFT的碎片总量
    mapping(uint256 => mapping(address => Fraction)) public fractions; // 每个NFT的碎片持有信息
    mapping(uint256 => address[]) public fractionOwners; // 记录每个 tokenId 的碎片所有者地址

    // 事件
    event NftListed(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price
    );
    event NftBought(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price, address royaltyReceiver, uint256 royaltyAmount);
    event NftDelisted(uint256 indexed tokenId, address indexed owner);
    event NFTFractionalized(uint256 indexed tokenId, uint256 totalFractions);
    event FractionForSale(uint256 indexed tokenId, address indexed owner, uint256 price);
    event FractionSaleCancelled(uint256 indexed tokenId, address indexed owner);
    event FractionBought(uint256 indexed tokenId, address indexed buyer, address indexed seller, uint256 amount, uint256 pricePerFraction);
    event FractionTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        uint256 amount
    );
    event NFTRedeemed(uint256 indexed tokenId, address indexed redeemer);

	constructor() ERC721("YourCollectible", "YCB") {}

	function _baseURI() internal pure override returns (string memory) {
		return "https://aqua-famous-koala-370.mypinata.cloud/ipfs/";
	}

	// 铸造NFT
	function mintItem(address to, string memory uri, uint96 royaltyFeeNumerator) public returns (uint256) {
		tokenIdCounter.increment();
		uint256 tokenId = tokenIdCounter.current();
		_safeMint(to, tokenId);
		_setTokenURI(tokenId, uri);

        // 设置版税信息, 版税比例royaltyFeeNumerator：250 for 2.5%, 500 for 5%, 1000 for 10%
        _setTokenRoyalty(tokenId, to, royaltyFeeNumerator);

        // 保存铸造者信息
		mintedBy[tokenId] = to;

		// 完整的 tokenURI
        string memory completeTokenURI = string(abi.encodePacked(_baseURI(), uri));

		// 初始化NFTItem信息
        nftItems[tokenId] = NFTItem({
            tokenId: tokenId,
            price: 0,
            owner: payable(to),
            isListed: false,
            tokenUri: completeTokenURI
        });
		
		return tokenId;
	}

    // 获取NFT的铸造者
	function getMintedBy(uint256 tokenId) public view returns (address) {
		return mintedBy[tokenId];
	}

	// 上架NFT
    function listItem(uint256 tokenId, uint256 price) public payable nonReentrant {
        require(msg.value == listingFee, "Must pay listing fee");
        require(ownerOf(tokenId) == msg.sender, "You are not the owner");
        require(price > 0, "Price must be greater than zero");
        require(!isFractionalized[tokenId], "Cannot list fractionalized NFT");

		// 将上架费用转给合约拥有者
        payable(owner()).transfer(listingFee);

        // 转移NFT到合约，并授权合约可以转移NFT
        // _transfer(msg.sender, address(this), tokenId);
        approve(address(this), tokenId);
        // setApprovalForAll(address(this), true);
        this.transferFrom(msg.sender, address(this), tokenId);

        // 更新NFT信息
        nftItems[tokenId].isListed = true;
        nftItems[tokenId].price = price;
        nftItems[tokenId].owner = payable(msg.sender);
		nftItems[tokenId].tokenUri = tokenURI(tokenId);

        emit NftListed(tokenId, msg.sender, price);
    }

    // 下架NFT
    function delistItem(uint256 tokenId) public nonReentrant {
        NFTItem storage item = nftItems[tokenId];

        require(item.isListed, "NFT is not listed");
        require(item.owner == msg.sender, "You are not the owner");

        // 更新NFT信息
        item.isListed = false;
        item.price = 0;

        // 将NFT转回给持有者
        this.transferFrom(address(this), msg.sender, tokenId);
        
        emit NftDelisted(tokenId, msg.sender);
    }

    // 购买NFT
    function buyItem(uint256 tokenId) public payable nonReentrant {
        NFTItem storage item = nftItems[tokenId];
        require(item.isListed, "NFT is not listed");
        require(msg.value == item.price, "Incorrect price");

        item.isListed = false;

        uint256 royaltyAmount = 0;
        address royaltyReceiver;

        // 获取版税接受者地址
        (royaltyReceiver, ) = royaltyInfo(tokenId, msg.value);

        // 如果当前卖家是铸造者，则不收取版税
        if (item.owner != royaltyReceiver) {
            (royaltyReceiver, royaltyAmount) = royaltyInfo(tokenId, msg.value);
            if (royaltyAmount > 0) {
                (bool royaltySuccess, ) = payable(royaltyReceiver).call{value: royaltyAmount}("");
                require(royaltySuccess, "Transfer to royalty receiver failed");
            }
        }
		
        // 记录卖家的地址和价格用以事件记录
        address payable seller = item.owner;
        uint256 price = item.price;

		// 更新NFT信息
        item.owner = payable(msg.sender);
        item.price = 0;

        // 计算卖家应得金额并转账
        uint256 sellerAmount = msg.value - royaltyAmount;
		(bool success, ) = seller.call{value: sellerAmount}("");
        require(success, "Transfer to seller failed");

        // 将NFT转移给买家,调用 transferFrom 函数不为"from"账户
        // _transfer(address(this), msg.sender, tokenId);
        this.transferFrom(address(this), msg.sender, tokenId);

        emit NftBought(tokenId, seller, msg.sender, price, royaltyReceiver, royaltyAmount);
    }

	// 获取所有上架的NFT
    function getAllListedItems() public view returns (NFTItem[] memory) {
        uint256 totalItems = tokenIdCounter.current();
        uint256 listedItemCount = 0;
        uint256 currentIndex = 0;

        // 统计当前上架的NFT数量
        for (uint256 i = 1; i <= totalItems; i++) {
            if (nftItems[i].isListed) {
                listedItemCount += 1;
            }
        }

        // 创建一个新数组来存储上架的NFT
        NFTItem[] memory items = new NFTItem[](listedItemCount);

        // 填充架的NFT
        for (uint256 i = 1; i <= totalItems; i++) {
            if (nftItems[i].isListed) {
                items[currentIndex] = nftItems[i];
                currentIndex += 1;
            }
        }

        return items;
    }
	
	// 根据 tokenId 获取对应的NFT信息
    function getNFTItemByTokenId(uint256 tokenId) public view returns (NFTItem memory) {
        require(_exists(tokenId), "NFT does not exist");
        return nftItems[tokenId];
    }

    // 合约拥有者提取合约中的上架费用
    function withdrawFees() public payable onlyOwner nonReentrant {
        payable(owner()).transfer(address(this).balance);
    }
    
    // 检查NFT是否已经碎片化
    function isNFTFractionalized(uint256 tokenId) public view returns (bool) {
        return isFractionalized[tokenId];
    }

    // 碎片化NFT
    function fractionalizeNFT(uint256 tokenId, uint256 total) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner of this NFT");
        require(!isFractionalized[tokenId], "NFT already fractionalized");
        require(total > 0, "Total fractions must be greater than zero");
        require(!nftItems[tokenId].isListed, "NFT is currently listed, must delist before fractionalizing");

        isFractionalized[tokenId] = true;
        totalFractions[tokenId] = total;
        fractions[tokenId][msg.sender] = Fraction({
            amount: total,
            isForSale: false,
            price: 0
        }); // 初始持有者拥有全部碎片
        fractionOwners[tokenId].push(msg.sender);

        emit NFTFractionalized(tokenId, total);
    }

    // 获取账户的碎片数量
    function getFractionsByAddress(address account) public view returns (uint256[] memory, Fraction[] memory) {
        uint256 totalTokens = tokenIdCounter.current();
        uint256 count = 0;

        // 先统计 account 持有的碎片的数量
        for (uint256 tokenId = 1; tokenId <= totalTokens; tokenId++) {
            if (fractions[tokenId][account].amount > 0) {
                count++;
            }
        }

        // 创建数组以存储结果
        uint256[] memory tokenIds = new uint256[](count);
        Fraction[] memory fractionss = new Fraction[](count);

        // 填充结果
        uint256 index = 0;
        for (uint256 tokenId = 1; tokenId <= totalTokens; tokenId++) {
            if (fractions[tokenId][account].amount > 0) {
                tokenIds[index] = tokenId;
                fractionss[index] = fractions[tokenId][account];
                index++;
            }
        }

        return (tokenIds, fractionss);
    }

    // 设置碎片出售
    function setFractionForSale(uint256 tokenId, uint256 price) public {
        require(isFractionalized[tokenId], "NFT is not fractionalized");
        Fraction storage userFraction = fractions[tokenId][msg.sender];
        require(userFraction.amount > 0, "You do not own any fractions");
        require(price > 0, "Price must be greater than zero");
    
        userFraction.isForSale = true;
        userFraction.price = price;
    
        emit FractionForSale(tokenId, msg.sender, price);
    }

    // 取消碎片出售
    function cancelFractionSale(uint256 tokenId) public {
        require(isFractionalized[tokenId], "NFT is not fractionalized");
        Fraction storage userFraction = fractions[tokenId][msg.sender];
        require(userFraction.isForSale, "Fraction is not for sale");
        require(userFraction.amount > 0, "You do not own any fractions");
    
        userFraction.isForSale = false;
        userFraction.price = 0;
    
        emit FractionSaleCancelled(tokenId, msg.sender);
    }

    // 购买碎片
    function buyFraction(uint256 tokenId, address seller, uint256 amount) public payable nonReentrant {
        require(isFractionalized[tokenId], "NFT is not fractionalized");
        Fraction storage sellerFraction = fractions[tokenId][seller];
        require(sellerFraction.isForSale, "Fraction is not for sale");
        require(sellerFraction.amount >= amount, "Insufficient fractions for sale");
        require(msg.value == sellerFraction.price * amount, "Incorrect payment amount");
    
        // 更新碎片持有量
        sellerFraction.amount -= amount;
        if (sellerFraction.amount == 0) {
            sellerFraction.isForSale = false;
            sellerFraction.price = 0;
        }
    
        fractions[tokenId][msg.sender].amount += amount;
    
        // 如果买家是首次购买该 tokenId 的碎片，添加到 fractionOwners
        if (fractions[tokenId][msg.sender].amount == amount) {
            fractionOwners[tokenId].push(msg.sender);
        }
    
        // 转移资金给卖家
        (bool success, ) = payable(seller).call{value: msg.value}("");
        require(success, "Transfer to seller failed");
    
        emit FractionBought(tokenId, msg.sender, seller, amount, sellerFraction.price);
    }

    // 转赠NFT碎片
    function transferFraction(uint256 tokenId, address to, uint256 amount) public {
        require(isFractionalized[tokenId], "NFT is not fractionalized");
        Fraction storage senderFraction = fractions[tokenId][msg.sender];
        require(senderFraction.amount >= amount, "Insufficient fractions");
        require(!senderFraction.isForSale, "Cannot transfer fractions that are for sale");

        senderFraction.amount -= amount;
        // 如果出售状态被部分或全部转移
        if (senderFraction.amount == 0) {
            senderFraction.isForSale = false;
            senderFraction.price = 0;
        }

        fractions[tokenId][to].amount += amount;

        // 如果接收者是首次接收该 tokenId 的碎片，添加到 fractionOwners
        if (fractions[tokenId][to].amount == amount) {
            fractionOwners[tokenId].push(to);
        }

        emit FractionTransferred(tokenId, msg.sender, to, amount);
    }

    // 集齐所有碎片召唤神龙
    function redeemNFT(uint256 tokenId) public {
        require(isFractionalized[tokenId], "NFT is not fractionalized");
        require(fractions[tokenId][msg.sender].amount == totalFractions[tokenId], "Must own all fractions");
    
        // 取消碎片化
        isFractionalized[tokenId] = false;
        totalFractions[tokenId] = 0;
        delete fractions[tokenId][msg.sender].isForSale;
        delete fractions[tokenId][msg.sender].price;
        fractions[tokenId][msg.sender].amount = 0;
    
        // 清空 fractionOwners 映射
        delete fractionOwners[tokenId];
    
        // 将NFT转移给持有全部碎片的用户
        address previousOwner = ownerOf(tokenId);
        _transfer(previousOwner, msg.sender, tokenId);
    
        // 更新NFTItem信息
        nftItems[tokenId].owner = payable(msg.sender);
        nftItems[tokenId].isListed = false; // 碎片化后通常不再上架
    
        emit NFTRedeemed(tokenId, msg.sender);
    }

    // 获取所有上架的碎片
    function getAllFractionsForSale() public view returns (uint256[] memory, address[] memory, Fraction[] memory) {
        uint256 totalTokens = tokenIdCounter.current();
        uint256 count = 0;

        // 统计所有上架的碎片数量
        for (uint256 tokenId = 1; tokenId <= totalTokens; tokenId++) {
            if (isFractionalized[tokenId]) {
                address[] memory ownerss = fractionOwners[tokenId];
                for (uint256 j = 0; j < ownerss.length; j++) {
                    address owner = ownerss[j];
                    if (fractions[tokenId][owner].isForSale) {
                        count++;
                    }
                }
            }
        }

        // 创建数组以存储结果
        uint256[] memory tokenIds = new uint256[](count);
        address[] memory owners = new address[](count);
        Fraction[] memory fractionsForSale = new Fraction[](count);

        // 填充结果
        uint256 index = 0;
        for (uint256 tokenId = 1; tokenId <= totalTokens; tokenId++) {
            if (isFractionalized[tokenId]) {
                address[] memory ownersList = fractionOwners[tokenId];
                for (uint256 j = 0; j < ownersList.length; j++) {
                    address owner = ownersList[j];
                    if (fractions[tokenId][owner].isForSale) {
                        tokenIds[index] = tokenId;
                        owners[index] = owner;
                        fractionsForSale[index] = fractions[tokenId][owner];
                        index++;
                    }
                }
            }
        }

        return (tokenIds, owners, fractionsForSale);
    }

	// 以下函数是 Solidity 所需的重写
	function _beforeTokenTransfer(
		address from,
		address to,
		uint256 tokenId,
		uint256 quantity
	) internal override(ERC721, ERC721Enumerable) {
		super._beforeTokenTransfer(from, to, tokenId, quantity); // 调用父类的函数
	}

	function _burn(
		uint256 tokenId
	) internal override(ERC721, ERC721URIStorage, ERC721Royalty) {
		super._burn(tokenId); // 调用父类的销毁函数
	}

	function tokenURI(
		uint256 tokenId
	) public view override(ERC721, ERC721URIStorage) returns (string memory) {
		return super.tokenURI(tokenId); // 获取 token 的 URI
	}

	function supportsInterface(
		bytes4 interfaceId
	)
		public
		view
		override(ERC721, ERC721Enumerable, ERC721URIStorage, ERC721Royalty)
		returns (bool)
	{
		return super.supportsInterface(interfaceId); // 检查接口支持
	}
}
