# Care Facility DX

ケアマネジャー向けの介護施設検索・問い合わせDXシステム。

## 概要

介護施設への空き状況確認や受入可否確認を、電話・FAX中心の業務からWeb上で完結できる仕組みへ移行することを目的とする。

ケアマネジャーが利用者の条件に合った介護施設を検索し、空き状況を確認して、そのまま問い合わせを行えるシステムを目指す。

## 主な機能

- 介護施設検索
- 施設詳細表示
- 空室状況確認
- 受入条件確認
- 料金情報確認
- 施設への問い合わせ
- 問い合わせ履歴管理
- 施設側からの回答
- お気に入り
- 通知

## 技術構成

### Frontend

- React
- TypeScript
- Vite

### Backend

- NestJS
- TypeScript
- TypeORM
- REST API
- Swagger

### Database

- PostgreSQL 17

### Infrastructure / Development

- Docker Desktop
- Docker Compose
- Git / GitHub

## ディレクトリ構成

```text
care-facility-dx/
├── backend/
├── frontend/
├── docker-compose.yml
├── .gitignore
└── README.md
```
