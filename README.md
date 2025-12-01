<div align="center">
  <img src="packages/frontend/public/otp-logo.svg" alt="OTP Manager Logo" width="120" height="120">

  # OTP Manager

  ### 🔐 Enterprise-Grade One-Time Password Management

  *Streamline OTP distribution and tracking for teams, organizations, and families*

  [![Build Status](https://img.shields.io/github/actions/workflow/status/gautamkrishnar/otpshare/publish-container.yml?branch=master)](https://github.com/gautamkrishnar/otpshare/actions)
  [![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

</div>

## Overview

OTP Manager is a self-hosted, enterprise-ready solution for managing and distributing one-time passwords across your organization. Whether you're managing guest WiFi access, temporary credentials, event passes, or service vouchers, OTP Manager provides a secure, efficient, and user-friendly platform for OTP lifecycle management.

## Features

- **📱 Progressive Web App** - Installable on any platform (iOS, Android, Windows, macOS, Linux)
- **🌐 Centralized OTP Distribution** - Single source of truth for all one-time passwords
- **👥 Multi-User Support** - Manage OTP access across unlimited users and teams
- **✅ Real-time Status Tracking** - Instant visibility into OTP usage and availability
- **🔒 Role-Based Access Control (RBAC)** - Granular permissions for admins and regular users
- **📥 Smart Import System** - Multiple import methods including plain text, PDF parsing, and bulk paste
- **🔌 Vendor Integrations** - Native support for network equipment vendors ([see supported vendors](#vendor-support--integrations))
- **🔄 Extensible Parser Framework** - Easy to add support for additional vendors and formats
- **📁 Bulk Operations** - Import, delete, and mark multiple OTPs as used in one action
- **🔍 Search & Filter** - Quickly find OTPs with advanced search and filtering capabilities

## Quick Start

### Container Deployment (Recommended)

#### Prerequisites
- Podman or Docker

#### Using Docker/Podman Compose

```bash
# Clone the repository
git clone https://github.com/gautamkrishnar/otpshare.git
cd otpshare

# Copy and configure environment
cp .env.example .env
# Edit .env with your configuration

# Start the application, this uses the pre-built Image
podman compose up -d
# or
docker compose up -d
```

The application will be available at `http://localhost:{PORT-GIVEN-IN-ENV}`

#### Default Credentials (First Run)
On first startup, you'll be prompted to create an admin account. No default credentials are set for security.

### Local Development

For detailed development setup instructions, see the **[Development Setup Guide](https://github.com/gautamkrishnar/otpshare/wiki/Development-Setup)** in the project wiki.

## Documentation

📖 **[Visit the Wiki](https://github.com/gautamkrishnar/otpshare/wiki)** for complete documentation

**Quick Links:**
- [Installation Guide](https://github.com/gautamkrishnar/otpshare/wiki/Installation-Guide) - Deploy with Docker or from source
- [Quick Import Guide](https://github.com/gautamkrishnar/otpshare/wiki/Quick-Import-Guide) - Import your first OTPs
- [TP-Link Omada Integration](https://github.com/gautamkrishnar/otpshare/wiki/TP%E2%80%90Link-Omada-Integration) - Import from Omada Controller
- [Development Setup](https://github.com/gautamkrishnar/otpshare/wiki/Development-Setup) - Set up local environment
- [Contributing Guide](https://github.com/gautamkrishnar/otpshare/wiki/Contributing) - How to contribute

## Vendor Support & Integrations

OTP Manager supports multiple methods for importing one-time passwords, including native integrations with popular network equipment vendors.

### Currently Supported

#### Network Equipment Vendors
- ✅ **[TP-Link Omada](https://github.com/gautamkrishnar/otpshare/wiki/TP%E2%80%90Link-Omada-Integration)** - Direct PDF voucher import from Omada Controller
  - Supports guest portal voucher exports
  - Automatic parsing and batch import
  - [View Integration Guide →](https://github.com/gautamkrishnar/otpshare/wiki/TP%E2%80%90Link-Omada-Integration)

#### Generic Import Methods
- ✅ **Plain Text** - Import from text files (one code per line)
- ✅ **Manual Entry** - Bulk paste codes into the admin interface

More vendors coming soon! [Request an integration](https://github.com/gautamkrishnar/otpshare/issues/new?labels=enhancement,integration) or view the [roadmap](https://github.com/gautamkrishnar/otpshare/wiki/Home#-integrations).

## Contributing

We welcome contributions! See the **[Contributing Guide](https://github.com/gautamkrishnar/otpshare/wiki/Contributing)** for details on:
- Development setup and workflow
- Code style and quality standards
- Pull request process
- Adding vendor integrations

## License

This project is licensed under the GNU Affero General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## Support & Community

- 🐛 **Report Issues**: [GitHub Issues](https://github.com/gautamkrishnar/otpshare/issues/new?labels=bug)
- 💡 **Feature Requests**: [GitHub Issues](https://github.com/gautamkrishnar/otpshare/issues/new?labels=enhancement)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/gautamkrishnar/otpshare/discussions)
- ⭐ **Star this project** if you find it useful!


<div align="center">
  Made with ❤️ and TypeScript
</div>
