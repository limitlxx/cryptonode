const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AaveArbitrageV1", function () {
  let arbitrage;
  let owner, user;
  let mockTokenA, mockTokenB;
  let mockDexRouter1, mockDexRouter2;
  let mockAavePool, mockAaveAddressesProvider;
  const AddressZero = ethers.ZeroAddress;

  before(async function () {
    [owner, user] = await ethers.getSigners();
  
    // Deploy mock contracts
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const MockDexRouter = await ethers.getContractFactory("MockDexRouter");
    const MockAavePool = await ethers.getContractFactory("MockAavePool");
    const MockAaveAddressesProvider = await ethers.getContractFactory("MockAaveAddressesProvider");
  
    // Deploy mocks with initial supply to owner
    mockTokenA = await MockERC20.deploy("TokenA", "TA", ethers.parseEther("10000000"), owner.address);
    mockTokenB = await MockERC20.deploy("TokenB", "TB", ethers.parseEther("10000000"), owner.address);
    
    mockDexRouter1 = await MockDexRouter.deploy();
    mockDexRouter2 = await MockDexRouter.deploy();
    mockAavePool = await MockAavePool.deploy();
    mockAaveAddressesProvider = await MockAaveAddressesProvider.deploy(mockAavePool.target);
  
    // Deploy main contract
    const AaveArbitrageV1 = await ethers.getContractFactory("AaveArbitrageV1");
    arbitrage = await AaveArbitrageV1.deploy(
      mockAaveAddressesProvider.target,
      // feeCollector.address,
      // 500,
      ethers.parseEther("0.1"),
      50
    );
  
    // Configure DEX routers
    await arbitrage.connect(owner).configureDex("Uniswap", mockDexRouter1.target);
    await arbitrage.connect(owner).configureDex("SushiSwap", mockDexRouter2.target);

    // Set the callback contract
    await mockAavePool.setCallbackContract(arbitrage.target);

    
    // Fund the arbitrage contract with a small amount of tokens for gas
    // await mockTokenA.connect(owner).transfer(arbitrage.target, ethers.parseEther("0.1"));

    // Fund the Aave pool with tokens
    await mockTokenA.connect(owner).approve(mockAavePool.target, ethers.MaxUint256);
    await mockTokenB.connect(owner).approve(mockAavePool.target, ethers.MaxUint256);
    await mockAavePool.connect(owner).depositToken(mockTokenA.target, ethers.parseEther("1000000"));
    await mockAavePool.connect(owner).depositToken(mockTokenB.target, ethers.parseEther("1000000"));

    // Fund routers with tokens
    await mockTokenA.connect(owner).transfer(mockDexRouter1.target, ethers.parseEther("1000000"));
    await mockTokenB.connect(owner).transfer(mockDexRouter1.target, ethers.parseEther("1000000"));
    await mockTokenA.connect(owner).transfer(mockDexRouter2.target, ethers.parseEther("1000000"));
    await mockTokenB.connect(owner).transfer(mockDexRouter2.target, ethers.parseEther("1000000"));
    
    // Set token out addresses for routers
    await mockDexRouter1.setTokenOut(mockTokenB.target);
    await mockDexRouter2.setTokenOut(mockTokenA.target);

    // Approve arbitrage contract to spend tokens
    await mockTokenA.connect(owner).approve(arbitrage.target, ethers.MaxUint256);
    await mockTokenB.connect(owner).approve(arbitrage.target, ethers.MaxUint256);

    // Transfer some tokens to the contract for testing
    await mockTokenA.connect(owner).transfer(arbitrage.target, ethers.parseEther("10"));
  
  });

  describe("Initialization", function () {
    it("Should set the correct owner", async function () {
      expect(await arbitrage.owner()).to.equal(owner.address);
    });

    // it("Should initialize with correct fee structure", async function () {
    //   // expect(await arbitrage.feeCollector()).to.equal(feeCollector.address);
    //   expect(await arbitrage.feePercentage()).to.equal(500);
    // });

    it("Should initialize with correct thresholds", async function () {
      expect(await arbitrage.minProfitThreshold()).to.equal(ethers.parseEther("0.1"));
      expect(await arbitrage.minSpreadThreshold()).to.equal(50);
    });

    it("Should initialize in unpaused state", async function () {
      expect(await arbitrage.isPaused()).to.be.false;
    });
  });

  describe("Configuration", function () {
    it("Should allow owner to configure DEX routers", async function () {
      await arbitrage.connect(owner).configureDex("TestDEX", mockDexRouter1.target);
      expect(await arbitrage.dexRouters("TestDEX")).to.equal(mockDexRouter1.target);
    });

    it("Should prevent non-owners from configuring DEX routers", async function () {
      await expect(
        arbitrage.connect(user).configureDex("SushiSwap", mockDexRouter2.target)
      ).to.be.revertedWithCustomError(arbitrage, "OwnableUnauthorizedAccount");
    });

    // it("Should allow owner to update fee structure", async function () {
    //   await arbitrage.connect(owner).updateFeeStructure(1000);
    //   // expect(await arbitrage.feeCollector()).to.equal(user.address);
    //   expect(await arbitrage.feePercentage()).to.equal(1000);
    // });

    it("Should prevent zero address router configuration", async function () {
      await expect(
        arbitrage.connect(owner).configureDex("BadDEX", AddressZero)
      ).to.be.revertedWith("Invalid router address");
    });

    // it("Should prevent fee percentage above 25%", async function () {
    //   await expect(
    //     arbitrage.connect(owner).updateFeeStructure(2501)
    //   ).to.be.revertedWith("Fee exceeds 25% cap");
    // });

    it("Should allow owner to update profit thresholds", async function () {
      await arbitrage.connect(owner).setProfitThresholds(
        ethers.parseEther("0.2"),
        100
      );
      expect(await arbitrage.minProfitThreshold()).to.equal(ethers.parseEther("0.2"));
      expect(await arbitrage.minSpreadThreshold()).to.equal(100);
    });
  });

  describe("Pause Functionality", function () {
    it("Should allow owner to toggle pause state", async function () {
      await arbitrage.connect(owner).togglePause();
      expect(await arbitrage.isPaused()).to.be.true;
      
      await arbitrage.connect(owner).togglePause();
      expect(await arbitrage.isPaused()).to.be.false;
    });

    it("Should prevent non-owners from toggling pause", async function () {
      await expect(
        arbitrage.connect(user).togglePause()
      ).to.be.revertedWithCustomError(arbitrage, "OwnableUnauthorizedAccount");
    });
  });

  describe("Arbitrage Execution", function () {
    beforeEach(async function () {
      // Ensure contract is not paused
      if (await arbitrage.isPaused()) {
        await arbitrage.connect(owner).togglePause();
      }
    });    

    it("Should execute arbitrage when conditions are met", async function () {
      const amount = ethers.parseEther("1");
      const path = [mockTokenA.target, mockTokenB.target];
      
      console.log("\n=== Starting Test ===");
      // Add to your test
      console.log("DEX1 TokenA balance:", await mockTokenA.balanceOf(mockDexRouter1.target));
      console.log("DEX1 TokenB balance:", await mockTokenB.balanceOf(mockDexRouter1.target));      
      
      // 1. Verify initial state
      console.log("1. Initial checks...");
      console.log("Pool balance:", await mockTokenA.balanceOf(mockAavePool.target));
      console.log("Arbitrage balance:", await mockTokenA.balanceOf(arbitrage.target));
      
      // 2. Execute arbitrage
      console.log("2. Executing arbitrage...");
      try {
          const tx = await arbitrage.connect(owner).executeArbitrage(
              mockTokenA.target,
              amount,
              "Uniswap",
              "SushiSwap",
              path,
              0
          );
          
          const receipt = await tx.wait();
          console.log("3. Transaction result:", receipt.status === 1 ? "Success" : "Failed");
          
          // 3. Verify final state
          console.log("4. Final checks...");
          console.log("Pool balance:", await mockTokenA.balanceOf(mockAavePool.target));
          console.log("Arbitrage balance:", await mockTokenA.balanceOf(arbitrage.target));
          // console.log("Fee collector balance:", await mockTokenA.balanceOf(feeCollector.address));
          
          expect(receipt.status).to.equal(1);
      } catch (error) {
          console.error("Test failed:", error);
          throw error;
      }
    });

    it("Should prevent execution when paused", async function () {
      await arbitrage.connect(owner).togglePause();
      
      const amount = ethers.parseEther("1");
      const path = [mockTokenA.target, mockTokenB.target];
      
      await expect(
        arbitrage.connect(owner).executeArbitrage(
          mockTokenA.target,
          amount,
          "Uniswap",
          "SushiSwap",
          path,
          0
        )
      ).to.be.revertedWith("Contract paused");
    });

    it("Should prevent execution with unconfigured DEX", async function () {
      const amount = ethers.parseEther("1");
      const path = [mockTokenA.target, mockTokenB.target];
      
      await expect(
        arbitrage.connect(owner).executeArbitrage(
          mockTokenA.target,
          amount,
          "UnconfiguredDEX",
          "SushiSwap",
          path,
          0
        )
      ).to.be.revertedWith("Source DEX not configured");
    });

    it("Should prevent execution with invalid path", async function () {
      const amount = ethers.parseEther("1");
      const invalidPath = [mockTokenA.target, mockTokenB.target, mockTokenA.target];
      
      await expect(
        arbitrage.connect(owner).executeArbitrage(
          mockTokenA.target,
          amount,
          "Uniswap",
          "SushiSwap",
          invalidPath,
          0
        )
      ).to.be.revertedWith("Simple arbitrage path only");
    });
  });

  describe("Profit Simulation", function () {
    it("Should correctly simulate profitable arbitrage", async function () {
      const amount = ethers.parseEther("1");
      const path = [mockTokenA.target, mockTokenB.target];
      
      // Set up profitable scenario (1.2x return)
      await mockDexRouter1.setAmountOut(ethers.parseEther("1.2")); // First swap gives 1.2 TokenB
      await mockDexRouter2.setAmountOut(ethers.parseEther("1.44")); // Second swap gives 1.44 TokenA
      
      const [profitable, potentialProfit, spreadBP] = await arbitrage.simulateArbitrage(
          mockTokenA.target,
          amount,
          "Uniswap",
          "SushiSwap",
          path
      );
      
      expect(profitable).to.be.true;
      expect(potentialProfit).to.be.gt(0);
      expect(spreadBP).to.be.gt(await arbitrage.minSpreadThreshold());
    });

    it("Should correctly identify unprofitable arbitrage", async function () {
      const amount = ethers.parseEther("1");
      const path = [mockTokenA.target, mockTokenB.target];
      
      // Set up mock swaps with unprofitable scenario
      const unprofitableAmount = ethers.parseEther("1.01");
      await mockDexRouter1.setAmountOut(unprofitableAmount);
      await mockDexRouter2.setAmountOut(unprofitableAmount);
      
      const [profitable, potentialProfit, spreadBP] = await arbitrage.simulateArbitrage(
        mockTokenA.target,
        amount,
        "Uniswap",
        "SushiSwap",
        path
      );
      
      expect(profitable).to.be.false;
    });
  });

  describe("Fee Collection", function () {

        // For "Should retain profits in contract"
      it("Should retain profits in contract 1", async function () {
        const loanAmount = ethers.parseEther("1");
        const path = [mockTokenA.target, mockTokenB.target];
        
        // Setup swaps
        await mockDexRouter1.setAmountOut(ethers.parseEther("1.2")); // 1 TA → 1.2 TB
        await mockDexRouter2.setAmountOut(ethers.parseEther("1.44")); // 1.2 TB → 1.44 TA

        const initialBalance = await mockTokenA.balanceOf(arbitrage.target);
        
        await arbitrage.connect(owner).executeArbitrage(
            mockTokenA.target,
            loanAmount,
            "Uniswap",
            "SushiSwap",
            path,
            0
        );
  
  const finalBalance = await mockTokenA.balanceOf(arbitrage.target);
  
  // Expected: initial + (1.44 - 1.0009) = initial + 0.4391
  const expectedProfit = ethers.parseEther("0.4391");
  expect(finalBalance).to.equal(initialBalance + expectedProfit);
});

    it("Should show profit entering at second swap 2.1", async () => {
      const loanAmount = ethers.parseEther("1");
      const path = [mockTokenA.target, mockTokenB.target];
      
      // Setup swaps with different rates
      await mockDexRouter1.setAmountOut(ethers.parseEther("1.33")); 
      await mockDexRouter2.setAmountOut(ethers.parseEther("1.66"));

      const initialBalance = await mockTokenA.balanceOf(arbitrage.target);
      
      await arbitrage.connect(owner).executeArbitrage(
          mockTokenA.target,
          loanAmount,
          "Uniswap",
          "SushiSwap",
          path,
          0
      );
      
      const finalBalance = await mockTokenA.balanceOf(arbitrage.target);
      const profit = finalBalance - initialBalance;
      
      // Expected: 1.66 - 1.33 - 0.0009 = 0.3291
      const expectedProfit = ethers.parseEther("0.6591");
      expect(profit).to.equal(expectedProfit);
    });

  });

  describe("Emergency Functions", function () {
    it("Should allow owner to rescue tokens", async function () {
        // Get initial balances
        const initialOwnerBalance = await mockTokenA.balanceOf(owner.address);
        const initialContractBalance = await mockTokenA.balanceOf(arbitrage.target);
        
        // Determine rescue amount (can't rescue more than contract has)
        const rescueAmount = ethers.parseEther("0.6591");
        const expectedTransfer = rescueAmount > initialContractBalance 
            ? initialContractBalance 
            : rescueAmount;
        
        // Execute rescue
        await arbitrage.connect(owner).rescueTokens(mockTokenA.target, rescueAmount);
        
        // Verify balances
        const finalOwnerBalance = await mockTokenA.balanceOf(owner.address);
        const finalContractBalance = await mockTokenA.balanceOf(arbitrage.target);
        
        // Owner should gain exactly what was transferred
        expect(finalOwnerBalance).to.equal(initialOwnerBalance + expectedTransfer);
        
        // Contract should lose exactly what was transferred
        expect(finalContractBalance).to.equal(initialContractBalance - expectedTransfer);
        
        // Verify event emission
        await expect(arbitrage.connect(owner).rescueTokens(mockTokenA.target, rescueAmount))
            .to.emit(arbitrage, "TokensRescued")
            .withArgs(mockTokenA.target, expectedTransfer);
    });

    it("Should prevent non-owners from rescuing tokens", async function () {
      await expect(
        arbitrage.connect(user).rescueTokens(mockTokenA.target, ethers.parseEther("0.6591"))
      ).to.be.revertedWithCustomError(arbitrage, "OwnableUnauthorizedAccount");
    });
  });
});