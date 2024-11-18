describe("connecting to PLAID", () => {
  it("initalizelink() should give us a link token", () => {
    var actual = initializeLink;
    expect(actual).toBeDefined();
  });
  it("startlink() should give us a start the link to PLAID", () => {
    var actual = startLink;
    expect(actual).toBeDefined();
  });
  it("exchangeToken() should give us an exchange token", () => {
    var actual = exchangeToken;
    expect(actual).toBeDefined();
  });
  it("checkconnect() should tell us that we're connected", () => {
    var actual = checkConnect;
    expect(actual).toBeTruthy();
  });
})


describe("connected to PLAID", () => {
  it("findbank() should find the users bank", () => {
    var actual = findBank;
    expect(actual).toBeDefined();
  });
  it("getAccounts() checks that we are connected and refers to helper function", () => {
    var accActual = getAccounts;
    expect(accActual).toBeDefined();
  });
  it("getTransactions() checks that we are connected and refers to helper function", () => {
    var tranActual = getTransactions;
    expect(tranActual).toBeDefined();
  });
})