import { test, expect } from 'playwright-test-coverage';

test.describe('admin tests', () =>{
  test('admin login and create franchise', async ({ page }) => {
    await page.route('*/**/api/auth', async (route) => {
      const loginReq = { email: 'a@jwt.com', password: 'admin' };
      const loginRes = { user: { id: 1, name: '常用名字', email: 'a@jwt.com', roles: [{ role: 'admin' }] }, token: 'abcdef' };
      expect(route.request().method()).toBe('PUT');
      expect(route.request().postDataJSON()).toMatchObject(loginReq);
      await route.fulfill({ json: loginRes });
    });
    await page.route('*/**/api/franchise', async (route) => {
      const franchiseRes = [];
      expect(route.request().method()).toBe('GET');
      await route.fulfill({ json: franchiseRes });
    });
    await page.goto('http://localhost:5173/');
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByPlaceholder('Email address').fill('a@jwt.com');
    await page.getByPlaceholder('Email address').press('Tab');
    await page.getByPlaceholder('Password').fill('admin');
    await page.getByPlaceholder('Password').press('Enter');
    await page.getByRole('link', { name: 'Admin' }).click();
    await expect(page.getByRole('heading')).toContainText('Mama Ricci\'s kitchen');
    await page.getByRole('button', { name: 'Add Franchise' }).click();
    await page.getByPlaceholder('franchise name').click();
    await page.getByPlaceholder('franchise name').fill('adminFranchise');
    await page.getByPlaceholder('franchise name').press('Tab');
    await page.getByPlaceholder('franchisee admin email').fill('a@jwt.com');
    await page.route('*/**/api/franchise', async (route) => {
      const franchiseRes = [{
        "stores": [],
        "name": "adminFranchise",
        "admins": [
          {
            "email": "a@jwt.com",
            "id": 1,
            "name": "常用名字"
          }
        ],
        "id": 1
      }];
      await route.fulfill({ json: franchiseRes });
    });
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByRole('button', { name: 'Close' })).toBeVisible();
  });


  test('admin create store, delete store', async ({ page }) => {
    await page.route('*/**/api/auth', async (route) => {
      const loginReq = { email: 'a@jwt.com', password: 'admin' };
      const loginRes = { user: { id: 1, name: '常用名字', email: 'a@jwt.com', roles: [{ role: 'admin' }] }, token: 'abcdef' };
      expect(route.request().method()).toBe('PUT');
      expect(route.request().postDataJSON()).toMatchObject(loginReq);
      await route.fulfill({ json: loginRes });
    });
         
    await page.route('*/**/api/franchise', async (route) => {
      const franchiseRes = [{
        "stores": [],
        "name": "adminFranchise",
        "admins": [
          {
            "email": "a@jwt.com",
            "id": 1,
            "name": "常用名字"
          }
        ],
        "id": 1
      }];
      expect(route.request().method()).toBe('GET');
      await route.fulfill({ json: franchiseRes });
    });

    await page.route('*/**/api/franchise/1/store', async (route) => {
      const storeReq = {"franchiseId": 1, "name":"SLC"};
      const storeRes = [{
        "franchiseId": storeReq.franchiseId,
        "name": storeReq.name,
        "id": 1
      }];
      expect(route.request().method()).toBe('POST');
      await route.fulfill({ json: storeRes });
    });

    await page.goto('http://localhost:5173/');
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByPlaceholder('Email address').fill('a@jwt.com');
    await page.getByPlaceholder('Email address').press('Tab');
    await page.getByPlaceholder('Password').fill('admin');
    await page.getByPlaceholder('Password').press('Enter');
    await page.getByRole('link', { name: 'Admin' }).click();

    await page.route('*/**/api/franchise/1', async (route) => {
      const storeRes = [
        {
          "id": 1,
          "name": "adminFranchise",
          "admins": [
            {
              "id": 1,
              "name": "常用名字",
              "email": "a@jwt.com"
            }
          ],
          "stores": []
        }
      ];
      expect(route.request().method()).toBe('GET');
      await route.fulfill({ json: storeRes });
    });
    await page.getByRole('link', { name: 'Franchise' }).click();
    await page.getByRole('button', { name: 'Create store' }).click();
    await page.getByPlaceholder('store name').click();
    await page.getByPlaceholder('store name').fill('firstStore');
    await page.route('*/**/api/franchise/1/store', async (route) => {
      const storeRes = [
        {
          "id": 1,
          "franchiseId": 1,
          "name": "firstStore"
        }
      ];
      expect(route.request().method()).toBe('POST');
      await route.fulfill({ json: storeRes });
    });
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByRole('heading')).toContainText('adminFranchise');
    await page.route('*/**/api/franchise/1', async (route) => {
      const storeRes = [
        {
          "id": 1,
          "name": "adminFranchise",
          "admins": [
            {
              "id": 1,
              "name": "常用名字",
              "email": "a@jwt.com"
            }
          ],
          "stores": [
            {
              "id": 1,
              "name": "firstStore",
              "totalRevenue": 0
            }
          ]
        }
      ];
      expect(route.request().method()).toBe("GET")
      await route.fulfill({ json: storeRes });
    });
    await page.reload();
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('main')).toContainText('Are you sure you want to close the adminFranchise store firstStore ? This cannot be restored. All outstanding revenue with not be refunded.');
    await page.route('*/**/api/franchise/1/store/1', async (route) => {
          const storeRes = [
            {
              "message": "store deleted"
            }
          ];
          expect(route.request().method()).toBe('DELETE');
          await route.fulfill({ json: storeRes });
        });
    await page.getByRole('button', { name: 'Close' }).click();
    await page.getByRole('link', { name: 'Admin' }).click();
    await page.getByRole('link', { name: 'admin-dashboard' }).click();
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('main')).toContainText('Are you sure you want to close the adminFranchise franchise? This will close all associated stores and cannot be restored. All outstanding revenue with not be refunded.');
    await page.route('*/**/api/franchise/1', async (route) => {
      const storeRes = [
        {
          "message": "franchise deleted"
        }
      ];
      expect(route.request().method()).toBe('DELETE');
      await route.fulfill({ json: storeRes });
    });
    await page.route('*/**/api/franchise', async (route) => {
      const franchiseRes = [];
      expect(route.request().method()).toBe('GET');
      await route.fulfill({ json: franchiseRes });
    });
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('main')).toContainText('Keep the dough rolling and the franchises signing up.');
    await page.route('*/**/api/auth', async (route) => {
      const logoutRes = {"message": "logout successful"};
      expect(route.request().method()).toBe('DELETE');
      await route.fulfill({ json: logoutRes });
    });
    await page.getByRole('link', { name: 'Logout' }).click();
  });
});