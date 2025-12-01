import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth';
import { SETTING_KEYS, SettingModel } from '../models/Setting';

export const getSettings = async (_req: AuthRequest, res: Response) => {
  try {
    const allSettings = await SettingModel.getAll();

    // Convert array to object for easier frontend consumption
    const settingsMap: Record<string, string> = {};
    for (const setting of allSettings) {
      settingsMap[setting.key] = setting.value;
    }

    // Ensure JWT expiration is included (from DB or default)
    const jwtExpirationHours = await SettingModel.getJWTExpirationHours();
    settingsMap[SETTING_KEYS.JWT_EXPIRATION_HOURS] = jwtExpirationHours.toString();

    res.json({ settings: settingsMap });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Settings object is required' });
    }

    // Update each setting
    for (const [key, value] of Object.entries(settings)) {
      if (typeof value !== 'string') {
        return res.status(400).json({ error: `Invalid value for setting: ${key}` });
      }

      // Special validation for JWT expiration hours
      if (key === SETTING_KEYS.JWT_EXPIRATION_HOURS) {
        const hours = Number.parseInt(value, 10);
        if (Number.isNaN(hours) || hours <= 0) {
          return res.status(400).json({ error: 'JWT expiration hours must be a positive number' });
        }
        await SettingModel.setJWTExpirationHours(hours);
      } else {
        await SettingModel.set(key, value);
      }
    }

    // Fetch updated settings
    const updatedSettings = await SettingModel.getAll();
    const settingsMap: Record<string, string> = {};
    for (const setting of updatedSettings) {
      settingsMap[setting.key] = setting.value;
    }

    // Ensure JWT expiration is included
    const jwtExpirationHours = await SettingModel.getJWTExpirationHours();
    settingsMap[SETTING_KEYS.JWT_EXPIRATION_HOURS] = jwtExpirationHours.toString();

    res.json({
      message: 'Settings updated successfully',
      settings: settingsMap
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
