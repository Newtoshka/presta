require('module-alias/register');

const {expect} = require('chai');

// Import utils
const helper = require('@utils/helpers');
const testContext = require('@utils/testContext');

// Import login steps
const loginCommon = require('@commonTests/BO/loginBO');

// Import BO pages
const dashboardPage = require('@pages/BO/dashboard');
const customerSettingsPage = require('@pages/BO/shopParameters/customerSettings');
const {options} = require('@pages/BO/shopParameters/customerSettings/options');

// Import FO pages
const foHomePage = require('@pages/FO/home');
const loginFOPage = require('@pages/FO/login');
const foCreateAccountPage = require('@pages/FO/myAccount/add');

const baseContext = 'functional_BO_shopParameters_customerSettings_customers_enablePartnerOffers';

let browserContext;
let page;

/*
Enable partner offer
Go to FO > create account and check that partner offer checkbox is visible
Disable partner offer
Go to FO > create account and check that partner offer checkbox is not visible
 */
describe('BO - Shop Parameters - Customer Settings : Enable/Disable partner offer', async () => {
  // before and after functions
  before(async function () {
    browserContext = await helper.createBrowserContext(this.browser);
    page = await helper.newTab(browserContext);
  });

  after(async () => {
    await helper.closeBrowserContext(browserContext);
  });

  it('should login in BO', async function () {
    await loginCommon.loginBO(this, page);
  });

  it('should go to \'Shop parameters > Customer Settings\' page', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'goToCustomerSettingsPage', baseContext);

    await dashboardPage.goToSubMenu(
      page,
      dashboardPage.shopParametersParentLink,
      dashboardPage.customerSettingsLink,
    );

    await customerSettingsPage.closeSfToolBar(page);

    const pageTitle = await customerSettingsPage.getPageTitle(page);
    await expect(pageTitle).to.contains(customerSettingsPage.pageTitle);
  });

  const tests = [
    {args: {action: 'disable', enable: false}},
    {args: {action: 'enable', enable: true}},
  ];

  tests.forEach((test, index) => {
    it(`should ${test.args.action} partner offer`, async function () {
      await testContext.addContextItem(this, 'testIdentifier', `partnerOffer${index}`, baseContext);

      const result = await customerSettingsPage.setOptionStatus(
        page,
        options.OPTION_PARTNER_OFFER,
        test.args.enable,
      );

      await expect(result).to.contains(customerSettingsPage.successfulUpdateMessage);
    });

    it('should go to create customer account in FO and check partner offer checkbox', async function () {
      await testContext.addContextItem(this, 'testIdentifier', `checkIsPartnerOffer${index}`, baseContext);

      // Go to FO
      page = await customerSettingsPage.viewMyShop(page);

      // Change language in FO
      await foHomePage.changeLanguage(page, 'en');

      // Go to create account page
      await foHomePage.goToLoginPage(page);
      await loginFOPage.goToCreateAccountPage(page);

      // Check partner offer
      const isPartnerOfferVisible = await foCreateAccountPage.isPartnerOfferVisible(page);
      await expect(isPartnerOfferVisible).to.be.equal(test.args.enable);
    });

    it('should go back to BO', async function () {
      await testContext.addContextItem(this, 'testIdentifier', `goBackToBO${index}`, baseContext);

      // Go back to BO
      page = await foCreateAccountPage.closePage(browserContext, page, 0);

      const pageTitle = await customerSettingsPage.getPageTitle(page);
      await expect(pageTitle).to.contains(customerSettingsPage.pageTitle);
    });
  });
});
