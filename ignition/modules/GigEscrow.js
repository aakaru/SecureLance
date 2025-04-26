const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("GigEscrowModule", (m) => {
  const gigEscrow = m.contract("GigEscrow");
  return { gigEscrow };
});
