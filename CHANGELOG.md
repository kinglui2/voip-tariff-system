# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- (Placeholder for upcoming features and improvements.)

---

## [1.0.0] - 2025-07-23
### Added
- Initial implementation of VoIP Tariff System.
- Supplier management: add, delete, and view suppliers.
- CSV import for supplier rates with flexible header mapping and synonym support.
- Consolidation logic: selects lowest and backup rates per prefix, upserts to consolidated_rates.
- Export endpoint: generates VoipSwitch-compatible CSV, auto-runs consolidation before export.
- Responsive frontend with MUI DataGrid and mobile supplier dropdown.
- Toast notifications for import, export, and delete actions.
- Modal confirmation dialog for supplier deletion.
- MySQL schema: suppliers, supplier_rates, consolidated_rates.
- Database export available in /database/voip_tariff_system.sql.
- **Currency:** Only Ksh (Kenyan Shilling) is currently supported for all suppliers and rates.

### Removed
- All debug and console log statements for production handover.

---

## [Planned]
### Added
- Advanced prefix search and filtering in the web UI.
- Enhanced reporting and analytics for rate management.
- More robust supplier management (edit, bulk actions, etc.).
- Improved CSV import: support for more formats, error reporting, and validation.
- Full VoipSwitch compatibility: ensure exported files meet all VoipSwitch requirements and edge cases.
- User authentication and access control for secure management.
- UI/UX improvements for dashboard and rate management.
- Automated testing and CI/CD setup.
- Comprehensive documentation and setup instructions.
- Support for additional business rules (e.g., currency conversion, custom rate logic, multi-currency support).
- Licensing and deployment instructions for production use. 