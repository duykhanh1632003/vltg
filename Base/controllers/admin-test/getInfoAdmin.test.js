const { getInfoAdmin } = require("../../controllers/vieclamtheogio/admin");
const functions = require("../../services/functions");

const AdminUser = require("../../models/ViecLamTheoGio/AdminUser");
const AdminUserRight = require("../../models/ViecLamTheoGio/AdminUserRight");
const Modules = require("../../models/ViecLamTheoGio/Modules");

jest.mock("../../services/functions");
jest.mock("../../models/ViecLamTheoGio/AdminUser");
jest.mock("../../models/ViecLamTheoGio/AdminUserRight");
jest.mock("../../models/ViecLamTheoGio/Modules");

beforeEach(() => {
  jest.clearAllMocks();
  functions.setError = jest.fn();
  functions.success = jest.fn();
});

describe("getInfoAdmin", () => {
  let req, res;

  beforeEach(() => {
    req = {
      infoAdmin: { adm_id: 123 },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it("✅ TC01: Admin KHÔNG phải là super admin => lấy quyền từ AdminUserRight.aggregate", async () => {
    const mockAdmin = {
      adm_id: 123,
      adm_isadmin: 0,
    };
    const mockAdminRights = [
      {
        mod_id: 1,
        adu_add: true,
        adu_edit: true,
        adu_delete: true,
        mod_path: "/dashboard",
        mod_order: 1,
        mod_listname: "Dashboard",
        mod_listfile: "dashboard.js",
        lang_id: "vi",
        mod_checkloca: false,
      },
    ];

    AdminUser.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(mockAdmin),
    });
    AdminUserRight.aggregate.mockResolvedValue(mockAdminRights);

    await getInfoAdmin(req, res);

    expect(AdminUser.findOne).toHaveBeenCalledWith({ adm_id: 123 });
    expect(AdminUserRight.aggregate).toHaveBeenCalled();
    expect(functions.success).toHaveBeenCalledWith(res, "Get list module success", {
      admin: { ...mockAdmin, adminRight: mockAdminRights },
    });
  });

  it("✅ TC02: Admin là super admin => lấy tất cả module từ Modules.find", async () => {
    const mockAdmin = {
      adm_id: 123,
      adm_isadmin: 1,
    };
    const mockModules = [
      {
        mod_id: 1,
        mod_order: 1,
        mod_path: "/admin",
        mod_listname: "Admin Panel",
      },
    ];
  
    AdminUser.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(mockAdmin),
    });
  
    Modules.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue(mockModules),
    });
  
    await getInfoAdmin(req, res);
  
    expect(AdminUser.findOne).toHaveBeenCalledWith({ adm_id: 123 });
    expect(Modules.find).toHaveBeenCalled();
    expect(functions.success).toHaveBeenCalledWith(res, "Get list module success", {
      admin: { ...mockAdmin, adminRight: mockModules },
    });
  });
  

  it("❌ TC03: Không tìm thấy admin => trả về lỗi 404", async () => {
    AdminUser.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    });

    await getInfoAdmin(req, res);

    expect(AdminUser.findOne).toHaveBeenCalledWith({ adm_id: 123 });
    expect(functions.setError).toHaveBeenCalledWith(res, "Admin not found!", 404);
  });
});
