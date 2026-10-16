// src/services/setting.service.js
// Setting business logic — system configuration

const { Setting } = require('../models');
const ApiError = require('../utils/ApiError');
const auditService = require('./audit.service');

class SettingService {
  /**
   * Notun setting create (Admin only)
   */
  async create(data, user, req) {
    // Key duplicate check
    const exists = await Setting.findOne({ key: data.key });
    if (exists) {
      throw new ApiError(409, 'Setting with this key already exists');
    }

    const setting = await Setting.create({
      ...data,
      updatedBy: user._id
    });

    await auditService.log({
      user: user._id,
      action: 'create',
      module: 'Setting',
      reference: setting._id,
      newData: { key: setting.key, value: setting.value },
      req
    });

    return setting;
  }

  /**
   * Sob setting list (category filter)
   */
  async getAll(query) {
    const { category, isSystem, sort = 'key' } = query;

    const filter = {};
    if (category) filter.category = category;
    if (isSystem !== undefined) filter.isSystem = isSystem === 'true';

    const settings = await Setting.find(filter).sort(sort).lean();

    // Group by category
    const grouped = {};
    for (const s of settings) {
      if (!grouped[s.category]) grouped[s.category] = [];
      grouped[s.category].push(s);
    }

    return { settings, grouped, count: settings.length };
  }

  /**
   * Category wise setting
   */
  async getByCategory(category) {
    const settings = await Setting.find({ category }).sort('key').lean();
    return { category, settings, count: settings.length };
  }

  /**
   * Ekta setting by key
   */
  async getByKey(key) {
    const setting = await Setting.findOne({ key: key.toLowerCase() }).populate(
      'updatedBy',
      'name'
    );
    if (!setting) {
      throw new ApiError(404, 'Setting not found');
    }
    return setting;
  }

  /**
   * Ekta setting value (internal use — jodi na thake default dey)
   * @param {String} key
   * @param {*} defaultValue
   */
  async getValue(key, defaultValue = null) {
    const setting = await Setting.findOne({ key: key.toLowerCase() });
    return setting ? setting.value : defaultValue;
  }

  /**
   * Setting update (value only)
   */
  async updateByKey(key, value, user, req) {
    const setting = await Setting.findOne({ key: key.toLowerCase() });
    if (!setting) {
      throw new ApiError(404, 'Setting not found');
    }

    const oldValue = setting.value;
    setting.value = value;
    setting.updatedBy = user._id;
    await setting.save();

    await auditService.log({
      user: user._id,
      action: 'setting_change',
      module: 'Setting',
      reference: setting._id,
      oldData: { key: setting.key, value: oldValue },
      newData: { key: setting.key, value },
      req
    });

    return setting;
  }

  /**
   * Bulk setting update
   */
  async bulkUpdate(settings, user, req) {
    const results = [];
    const oldValues = [];

    for (const { key, value } of settings) {
      const setting = await Setting.findOne({ key: key.toLowerCase() });
      if (!setting) {
        throw new ApiError(404, `Setting not found: ${key}`);
      }

      oldValues.push({ key: setting.key, value: setting.value });
      setting.value = value;
      setting.updatedBy = user._id;
      await setting.save();
      results.push(setting);
    }

    await auditService.log({
      user: user._id,
      action: 'setting_change',
      module: 'Setting',
      newData: { bulkUpdate: true, count: results.length },
      req
    });

    return { updated: results.length, settings: results };
  }

  /**
   * Setting delete (system setting delete block)
   */
  async remove(key, user, req) {
    const setting = await Setting.findOne({ key: key.toLowerCase() });
    if (!setting) {
      throw new ApiError(404, 'Setting not found');
    }

    // System setting delete kora jabe na
    if (setting.isSystem) {
      throw new ApiError(400, 'Cannot delete system setting');
    }

    await Setting.findByIdAndDelete(setting._id);

    await auditService.log({
      user: user._id,
      action: 'delete',
      module: 'Setting',
      reference: setting._id,
      oldData: { key: setting.key, value: setting.value },
      req
    });

    return { message: 'Setting deleted successfully' };
  }

  /**
   * Initial settings seed (jodi na thake)
   * @private
   */
  async _ensureDefaults() {
    const defaults = [
      { key: 'invoice_prefix', value: 'SL', category: 'invoice', dataType: 'string', isSystem: true, label: 'Sale Invoice Prefix' },
      { key: 'purchase_prefix', value: 'PU', category: 'invoice', dataType: 'string', isSystem: true, label: 'Purchase Invoice Prefix' },
      { key: 'sales_return_prefix', value: 'SR', category: 'invoice', dataType: 'string', isSystem: true, label: 'Sales Return Prefix' },
      { key: 'purchase_return_prefix', value: 'PR', category: 'invoice', dataType: 'string', isSystem: true, label: 'Purchase Return Prefix' },
      { key: 'expiry_threshold_days', value: 30, category: 'expiry', dataType: 'number', isSystem: true, label: 'Expiry Alert Threshold (Days)' },
      { key: 'currency', value: 'BDT', category: 'general', dataType: 'string', isSystem: true, label: 'Currency' },
      { key: 'currency_symbol', value: '৳', category: 'general', dataType: 'string', isSystem: true, label: 'Currency Symbol' },
      { key: 'low_stock_alert', value: true, category: 'notification', dataType: 'boolean', isSystem: true, label: 'Low Stock Alert' },
      { key: 'expiry_alert', value: true, category: 'notification', dataType: 'boolean', isSystem: true, label: 'Expiry Alert' }
    ];

    for (const d of defaults) {
      const exists = await Setting.findOne({ key: d.key });
      if (!exists) {
        await Setting.create(d);
      }
    }
  }
}

module.exports = new SettingService();