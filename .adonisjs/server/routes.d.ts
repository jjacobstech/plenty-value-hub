import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'seo.sitemap': { paramsTuple?: []; params?: {} }
    'seo.robots': { paramsTuple?: []; params?: {} }
    'home': { paramsTuple?: []; params?: {} }
    'marketplace': { paramsTuple?: []; params?: {} }
    'reviews': { paramsTuple?: []; params?: {} }
    'product.detail': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'affiliate.redirect': { paramsTuple: [ParamValue]; params: {'link_code': ParamValue} }
    'for.partners': { paramsTuple?: []; params?: {} }
    'privacy': { paramsTuple?: []; params?: {} }
    'track.order': { paramsTuple?: []; params?: {} }
    'legacy.login': { paramsTuple?: []; params?: {} }
    'legacy.register': { paramsTuple?: []; params?: {} }
    'legacy.forgot.password': { paramsTuple?: []; params?: {} }
    'legacy.reset.password': { paramsTuple?: []; params?: {} }
    'legacy.verify.email': { paramsTuple?: []; params?: {} }
    'register': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'new_account.register_step_1': { paramsTuple?: []; params?: {} }
    'new_account.register_step_2': { paramsTuple?: []; params?: {} }
    'new_account.register_step_3': { paramsTuple?: []; params?: {} }
    'new_account.verify_otp': { paramsTuple?: []; params?: {} }
    'new_account.resend_otp': { paramsTuple?: []; params?: {} }
    'login': { paramsTuple?: []; params?: {} }
    'new_account.login': { paramsTuple?: []; params?: {} }
    'verify.email': { paramsTuple?: []; params?: {} }
    'forgot.password': { paramsTuple?: []; params?: {} }
    'new_account.forgot_password': { paramsTuple?: []; params?: {} }
    'reset.password': { paramsTuple?: []; params?: {} }
    'new_account.reset_password': { paramsTuple?: []; params?: {} }
    'google.redirect': { paramsTuple?: []; params?: {} }
    'google.callback': { paramsTuple?: []; params?: {} }
    'logout': { paramsTuple?: []; params?: {} }
    'admin.auth.login': { paramsTuple?: []; params?: {} }
    'admin.auth.setup.google': { paramsTuple?: []; params?: {} }
    'admin.auth.login.google': { paramsTuple?: []; params?: {} }
    'admin.auth.callback': { paramsTuple?: []; params?: {} }
    'admin.dashboard': { paramsTuple?: []; params?: {} }
    'admin.users': { paramsTuple?: []; params?: {} }
    'admin.products': { paramsTuple?: []; params?: {} }
    'admin.orders': { paramsTuple?: []; params?: {} }
    'admin.analytics': { paramsTuple?: []; params?: {} }
    'admin.subscribers': { paramsTuple?: []; params?: {} }
    'admin.blog': { paramsTuple?: []; params?: {} }
    'admin.newsletters': { paramsTuple?: []; params?: {} }
    'admin.newsletter': { paramsTuple?: []; params?: {} }
    'admin.email.campaigns': { paramsTuple?: []; params?: {} }
    'admin.conversions': { paramsTuple?: []; params?: {} }
    'admin.hero.banner': { paramsTuple?: []; params?: {} }
    'admin.payment.settings': { paramsTuple?: []; params?: {} }
    'admin.payouts': { paramsTuple?: []; params?: {} }
    'admin.disputes': { paramsTuple?: []; params?: {} }
    'admin.fraud': { paramsTuple?: []; params?: {} }
    'vendor.dashboard': { paramsTuple?: []; params?: {} }
    'vendor.products': { paramsTuple?: []; params?: {} }
    'vendor.orders': { paramsTuple?: []; params?: {} }
    'vendor.kyc': { paramsTuple?: []; params?: {} }
    'vendor.earnings': { paramsTuple?: []; params?: {} }
    'vendor.analytics': { paramsTuple?: []; params?: {} }
    'vendor.profile': { paramsTuple?: []; params?: {} }
    'vendor.integrations': { paramsTuple?: []; params?: {} }
    'affiliate.dashboard': { paramsTuple?: []; params?: {} }
    'affiliate.products': { paramsTuple?: []; params?: {} }
    'affiliate.campaigns.discover': { paramsTuple?: []; params?: {} }
    'affiliate.links': { paramsTuple?: []; params?: {} }
    'affiliate.earnings': { paramsTuple?: []; params?: {} }
    'affiliate.performance': { paramsTuple?: []; params?: {} }
    'affiliate.profile': { paramsTuple?: []; params?: {} }
    'products.index': { paramsTuple?: []; params?: {} }
    'products.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'campaigns.discover': { paramsTuple?: []; params?: {} }
    'campaigns.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'shopify.handle_callback': { paramsTuple?: []; params?: {} }
    'purchase_destinations.handle_redirect': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'newsletters.subscribe': { paramsTuple?: []; params?: {} }
    'newsletters.unsubscribe': { paramsTuple?: []; params?: {} }
    'affiliate_links.track_click': { paramsTuple?: []; params?: {} }
    'reviews.index': { paramsTuple?: []; params?: {} }
    'currency.list_currencies': { paramsTuple?: []; params?: {} }
    'currency.get_currency': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
    'currency.convert_currency': { paramsTuple?: []; params?: {} }
    'currency.get_supported_regions': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
    'currency.get_exchange_rate_history': { paramsTuple: [ParamValue,ParamValue]; params: {'from': ParamValue,'to': ParamValue} }
    'site_settings.payment_config': { paramsTuple?: []; params?: {} }
    'payment.providers': { paramsTuple?: []; params?: {} }
    'payment.initialize': { paramsTuple?: []; params?: {} }
    'payment.verify': { paramsTuple?: []; params?: {} }
    'orders.track_order': { paramsTuple?: []; params?: {} }
    'orders.download_digital_asset': { paramsTuple?: []; params?: {} }
    'affiliates.get_top_performers': { paramsTuple?: []; params?: {} }
    'affiliates.get_affiliates_by_tier': { paramsTuple: [ParamValue]; params: {'tier': ParamValue} }
    'mobile_api.get_app_config': { paramsTuple?: []; params?: {} }
    'mobile_api.get_device_info': { paramsTuple?: []; params?: {} }
    'mobile_api.health_check': { paramsTuple?: []; params?: {} }
    'mobile_api.get_help': { paramsTuple?: []; params?: {} }
    'mobile_api.report_error': { paramsTuple?: []; params?: {} }
    'webhook.stripe_webhook': { paramsTuple?: []; params?: {} }
    'webhook.paystack_webhook': { paramsTuple?: []; params?: {} }
    'webhook.flutterwave_webhook': { paramsTuple?: []; params?: {} }
    'webhook.paypal_webhook': { paramsTuple?: []; params?: {} }
    'webhook.handle_webhook': { paramsTuple: [ParamValue]; params: {'provider': ParamValue} }
    'products.store': { paramsTuple?: []; params?: {} }
    'products.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'products.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'campaigns.create': { paramsTuple?: []; params?: {} }
    'campaigns.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'campaigns.submit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'campaigns.pause': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'campaigns.resume': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'campaigns.vendor_campaigns': { paramsTuple?: []; params?: {} }
    'campaigns.join': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'campaigns.affiliate_campaigns': { paramsTuple?: []; params?: {} }
    'purchase_destinations.configure_campaign_destination': { paramsTuple: [ParamValue]; params: {'campaignId': ParamValue} }
    'purchase_destinations.generate_redirect_link': { paramsTuple: [ParamValue]; params: {'campaignId': ParamValue} }
    'purchase_destinations.get_stats': { paramsTuple: [ParamValue]; params: {'campaignId': ParamValue} }
    'purchase_destinations.record_conversion': { paramsTuple: [ParamValue]; params: {'campaignId': ParamValue} }
    'vendor_conversions.report_conversion': { paramsTuple: [ParamValue]; params: {'campaignId': ParamValue} }
    'vendor_conversions.index': { paramsTuple: [ParamValue]; params: {'campaignId': ParamValue} }
    'vendor_conversions.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'vendor_conversions.dispute': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'vendor_conversions.get_stats': { paramsTuple: [ParamValue]; params: {'campaignId': ParamValue} }
    'commission_ledger.index': { paramsTuple?: []; params?: {} }
    'commission_ledger.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'commission_ledger.dispute': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'commission_ledger.get_stats': { paramsTuple?: []; params?: {} }
    'commission_ledger.campaign_stats': { paramsTuple: [ParamValue]; params: {'campaignId': ParamValue} }
    'refunds_chargebacks.report': { paramsTuple?: []; params?: {} }
    'refunds_chargebacks.index': { paramsTuple?: []; params?: {} }
    'refunds_chargebacks.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'refunds_chargebacks.get_stats': { paramsTuple?: []; params?: {} }
    'orders.index': { paramsTuple?: []; params?: {} }
    'orders.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'orders.process_order': { paramsTuple?: []; params?: {} }
    'vendor.orders.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'orders.notify_vendor': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'affiliate_links.index': { paramsTuple?: []; params?: {} }
    'affiliate_links.create': { paramsTuple?: []; params?: {} }
    'affiliate_links.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'affiliate_links.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'affiliate_links.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'affiliate_links.metrics': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'affiliate_links.conversions': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'affiliate_links.track_click_slug': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'affiliate_links.report_conversion': { paramsTuple?: []; params?: {} }
    'reviews.store': { paramsTuple?: []; params?: {} }
    'profile.update_affiliate': { paramsTuple?: []; params?: {} }
    'profile.update_vendor': { paramsTuple?: []; params?: {} }
    'profile.upload_image': { paramsTuple?: []; params?: {} }
    'upload.upload_product_image': { paramsTuple?: []; params?: {} }
    'upload.upload_product_gallery': { paramsTuple?: []; params?: {} }
    'upload.upload_digital_asset': { paramsTuple?: []; params?: {} }
    'upload.upload_profile_image': { paramsTuple?: []; params?: {} }
    'upload.upload_admin_image': { paramsTuple?: []; params?: {} }
    'upload.upload_video': { paramsTuple?: []; params?: {} }
    'upload.upload_document': { paramsTuple?: []; params?: {} }
    'upload.upload_file': { paramsTuple?: []; params?: {} }
    'payouts.wallet': { paramsTuple?: []; params?: {} }
    'payouts.request_payout': { paramsTuple?: []; params?: {} }
    'payouts.history': { paramsTuple?: []; params?: {} }
    'payouts.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'payouts.add_payment_method': { paramsTuple?: []; params?: {} }
    'payouts.payment_methods': { paramsTuple?: []; params?: {} }
    'notifications.index': { paramsTuple?: []; params?: {} }
    'notifications.get_unread_count': { paramsTuple?: []; params?: {} }
    'notifications.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'notifications.mark_as_read': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'notifications.mark_all_as_read': { paramsTuple?: []; params?: {} }
    'notifications.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'notifications.destroy_all': { paramsTuple?: []; params?: {} }
    'admin_dashboard.overview': { paramsTuple?: []; params?: {} }
    'admin_dashboard.pending_campaigns': { paramsTuple?: []; params?: {} }
    'admin_dashboard.recent_conversions': { paramsTuple?: []; params?: {} }
    'admin_dashboard.users': { paramsTuple?: []; params?: {} }
    'admin_dashboard.commission_stats': { paramsTuple?: []; params?: {} }
    'admin_dashboard.payout_stats': { paramsTuple?: []; params?: {} }
    'admin_dashboard.top_campaigns': { paramsTuple?: []; params?: {} }
    'admin_dashboard.top_affiliates': { paramsTuple?: []; params?: {} }
    'admin_dashboard.financial_overview': { paramsTuple?: []; params?: {} }
    'admin_dashboard.system_health': { paramsTuple?: []; params?: {} }
    'admin_dashboard.platform_activity': { paramsTuple?: []; params?: {} }
    'admin.get_platform_stats': { paramsTuple?: []; params?: {} }
    'admin.auth_status': { paramsTuple?: []; params?: {} }
    'admin.debug_paystack_banks': { paramsTuple?: []; params?: {} }
    'admin.test_email': { paramsTuple?: []; params?: {} }
    'products.approve': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'campaigns.approve': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'campaigns.reject': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'vendor_conversions.approve': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'vendor_conversions.reject': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'vendor_conversions.reverse': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'commission_ledger.approve': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'commission_ledger.reject': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'commission_ledger.mark_as_paid': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'commission_ledger.bulk_approve': { paramsTuple?: []; params?: {} }
    'refunds_chargebacks.verify': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'refunds_chargebacks.approve': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'refunds_chargebacks.reject': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'refunds_chargebacks.complete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_fraud.get_flagged': { paramsTuple?: []; params?: {} }
    'admin_fraud.approve_conversion': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_fraud.reject_conversion': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_fraud.get_stats': { paramsTuple?: []; params?: {} }
    'admin_fraud.analyze_conversion': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_dispute.get_disputes': { paramsTuple?: []; params?: {} }
    'admin_dispute.get_dispute': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_dispute.add_evidence': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_dispute.escalate_dispute': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_dispute.resolve_dispute': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_dispute.get_stats': { paramsTuple?: []; params?: {} }
    'admin_dispute.auto_resolve': { paramsTuple?: []; params?: {} }
    'admin_payout.get_payouts': { paramsTuple?: []; params?: {} }
    'admin_payout.check_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_payout.get_banks': { paramsTuple?: []; params?: {} }
    'admin_payout.verify_bank_account': { paramsTuple?: []; params?: {} }
    'admin_payout.get_stats': { paramsTuple?: []; params?: {} }
    'admin_payout.handle_webhook': { paramsTuple?: []; params?: {} }
    'fraud_analytics.get_stats': { paramsTuple?: []; params?: {} }
    'fraud_analytics.list_flagged': { paramsTuple?: []; params?: {} }
    'fraud_analytics.get_fraud_details': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'fraud_analytics.approve_fraud_flag': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'fraud_analytics.reject_fraud_flag': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'fraud_analytics.auto_reject_high_risk': { paramsTuple?: []; params?: {} }
    'fraud_analytics.get_trends': { paramsTuple?: []; params?: {} }
    'fraud_analytics.get_top_flags': { paramsTuple?: []; params?: {} }
    'analytics.get_metrics': { paramsTuple?: []; params?: {} }
    'analytics.get_summary': { paramsTuple?: []; params?: {} }
    'analytics.list_campaigns': { paramsTuple?: []; params?: {} }
    'analytics.get_campaign_metrics': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'analytics.list_affiliates': { paramsTuple?: []; params?: {} }
    'analytics.get_affiliate_metrics': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'analytics.get_commissions': { paramsTuple?: []; params?: {} }
    'analytics.get_commission_schedule': { paramsTuple?: []; params?: {} }
    'analytics.export_conversions': { paramsTuple?: []; params?: {} }
    'analytics.export_commissions': { paramsTuple?: []; params?: {} }
    'influencers.create_profile': { paramsTuple?: []; params?: {} }
    'influencers.get_profile': { paramsTuple?: []; params?: {} }
    'influencers.update_profile': { paramsTuple?: []; params?: {} }
    'influencers.get_stats': { paramsTuple?: []; params?: {} }
    'influencers.list_collaborations': { paramsTuple?: []; params?: {} }
    'influencers.get_collaboration': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'influencers.accept_collaboration': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'influencers.create_content': { paramsTuple?: []; params?: {} }
    'influencers.list_content': { paramsTuple?: []; params?: {} }
    'influencers.get_content_analytics': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'influencers.get_content_performance': { paramsTuple?: []; params?: {} }
    'influencers.update_content': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'influencers.list_influencers': { paramsTuple?: []; params?: {} }
    'influencers.view_influencer': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'influencers.verify_influencer': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'influencers.reject_influencer': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'shopify.get_auth_url': { paramsTuple?: []; params?: {} }
    'shopify.get_store': { paramsTuple?: []; params?: {} }
    'shopify.disconnect': { paramsTuple?: []; params?: {} }
    'shopify.sync_products': { paramsTuple?: []; params?: {} }
    'shopify.sync_orders': { paramsTuple?: []; params?: {} }
    'shopify.list_products': { paramsTuple?: []; params?: {} }
    'shopify.update_product': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'shopify.list_orders': { paramsTuple?: []; params?: {} }
    'shopify.get_order': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'shopify.calculate_commissions': { paramsTuple?: []; params?: {} }
    'shopify.get_analytics': { paramsTuple?: []; params?: {} }
    'woocommerce.connect': { paramsTuple?: []; params?: {} }
    'woocommerce.get_store': { paramsTuple?: []; params?: {} }
    'woocommerce.disconnect': { paramsTuple?: []; params?: {} }
    'woocommerce.sync_products': { paramsTuple?: []; params?: {} }
    'woocommerce.sync_orders': { paramsTuple?: []; params?: {} }
    'woocommerce.list_products': { paramsTuple?: []; params?: {} }
    'woocommerce.update_product': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'woocommerce.list_orders': { paramsTuple?: []; params?: {} }
    'woocommerce.calculate_commissions': { paramsTuple?: []; params?: {} }
    'woocommerce.get_analytics': { paramsTuple?: []; params?: {} }
    'currency.format_amount': { paramsTuple?: []; params?: {} }
    'currency.get_regional_price': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'region': ParamValue} }
    'currency.set_regional_pricing': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'currency.list_product_pricing': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'currency.update_exchange_rates': { paramsTuple?: []; params?: {} }
    'admin.update_user': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.delete_user': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reviews.approve': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'payouts.admin_index': { paramsTuple?: []; params?: {} }
    'payouts.approve': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'payouts.reject': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'payouts.process': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'payouts.complete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'payouts.fail': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'blog_posts.index': { paramsTuple?: []; params?: {} }
    'blog_posts.store': { paramsTuple?: []; params?: {} }
    'blog_posts.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'blog_posts.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'newsletter_admin.index': { paramsTuple?: []; params?: {} }
    'newsletter_admin.store': { paramsTuple?: []; params?: {} }
    'newsletter_admin.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'newsletter_admin.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'email_campaigns.index': { paramsTuple?: []; params?: {} }
    'email_campaigns.store': { paramsTuple?: []; params?: {} }
    'email_campaigns.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'email_campaigns.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'site_settings.index': { paramsTuple?: []; params?: {} }
    'site_settings.upsert': { paramsTuple?: []; params?: {} }
    'site_settings.upload_image': { paramsTuple?: []; params?: {} }
    'site_settings.show': { paramsTuple: [ParamValue]; params: {'key': ParamValue} }
    'webhook.get_webhook_endpoints': { paramsTuple?: []; params?: {} }
    'webhook.test_webhook': { paramsTuple: [ParamValue]; params: {'provider': ParamValue} }
    'payment_settings.index': { paramsTuple?: []; params?: {} }
    'payment_settings.status_list': { paramsTuple?: []; params?: {} }
    'payment_settings.store': { paramsTuple?: []; params?: {} }
    'payment_settings.show': { paramsTuple: [ParamValue]; params: {'gateway': ParamValue} }
    'payment_settings.update': { paramsTuple: [ParamValue]; params: {'gateway': ParamValue} }
    'payment_settings.toggle': { paramsTuple: [ParamValue]; params: {'gateway': ParamValue} }
    'payment_settings.destroy': { paramsTuple: [ParamValue]; params: {'gateway': ParamValue} }
    'kyc.list_pending_submissions': { paramsTuple?: []; params?: {} }
    'kyc.get_statistics': { paramsTuple?: []; params?: {} }
    'kyc.search_submissions': { paramsTuple?: []; params?: {} }
    'kyc.verify_document': { paramsTuple: [ParamValue,ParamValue]; params: {'submissionId': ParamValue,'documentId': ParamValue} }
    'kyc.assess_risk': { paramsTuple: [ParamValue]; params: {'submissionId': ParamValue} }
    'kyc.check_compliance': { paramsTuple: [ParamValue]; params: {'submissionId': ParamValue} }
    'kyc.approve_submission': { paramsTuple: [ParamValue]; params: {'submissionId': ParamValue} }
    'kyc.reject_submission': { paramsTuple: [ParamValue]; params: {'submissionId': ParamValue} }
    'reports.create_configuration': { paramsTuple?: []; params?: {} }
    'reports.list_configurations': { paramsTuple?: []; params?: {} }
    'reports.get_configuration': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reports.update_configuration': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reports.delete_configuration': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reports.generate_report': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reports.list_report_logs': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reports.get_report_log': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reports.download_report': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reports.create_schedule': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reports.list_schedules': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reports.update_schedule': { paramsTuple: [ParamValue]; params: {'scheduleId': ParamValue} }
    'reports.delete_schedule': { paramsTuple: [ParamValue]; params: {'scheduleId': ParamValue} }
    'reports.archive_report': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reports.get_stats': { paramsTuple?: []; params?: {} }
    'disputes.list_open_disputes': { paramsTuple?: []; params?: {} }
    'disputes.list_escalated_disputes': { paramsTuple?: []; params?: {} }
    'disputes.filter_disputes': { paramsTuple?: []; params?: {} }
    'disputes.get_dashboard_stats': { paramsTuple?: []; params?: {} }
    'disputes.update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'disputes.resolve_dispute': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'disputes.assign_dispute': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'disputes.escalate_dispute': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'disputes.request_approval': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'disputes.approve_dispute': { paramsTuple: [ParamValue]; params: {'approvalId': ParamValue} }
    'disputes.reject_dispute': { paramsTuple: [ParamValue]; params: {'approvalId': ParamValue} }
    'affiliates.create_campaign': { paramsTuple?: []; params?: {} }
    'affiliates.list_campaigns': { paramsTuple?: []; params?: {} }
    'affiliates.launch_campaign': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'affiliates.complete_campaign': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'disputes.file_dispute': { paramsTuple?: []; params?: {} }
    'disputes.list_user_disputes': { paramsTuple?: []; params?: {} }
    'disputes.get_dispute': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'disputes.get_comments': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'disputes.add_comment': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'amazon.get_auth_url': { paramsTuple?: []; params?: {} }
    'amazon.handle_callback': { paramsTuple?: []; params?: {} }
    'amazon.list_accounts': { paramsTuple?: []; params?: {} }
    'amazon.get_campaigns': { paramsTuple?: []; params?: {} }
    'etsy.get_auth_url': { paramsTuple?: []; params?: {} }
    'etsy.handle_callback': { paramsTuple?: []; params?: {} }
    'etsy.list_shops': { paramsTuple?: []; params?: {} }
    'etsy.get_listings': { paramsTuple?: []; params?: {} }
    'etsy.get_orders': { paramsTuple?: []; params?: {} }
    'affiliates.create_profile': { paramsTuple?: []; params?: {} }
    'affiliates.get_profile': { paramsTuple?: []; params?: {} }
    'affiliates.update_profile': { paramsTuple?: []; params?: {} }
    'affiliates.generate_referral_code': { paramsTuple?: []; params?: {} }
    'affiliates.get_referral_codes': { paramsTuple?: []; params?: {} }
    'affiliates.get_referral_code_performance': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'affiliates.get_referrals': { paramsTuple?: []; params?: {} }
    'affiliates.get_rewards': { paramsTuple?: []; params?: {} }
    'affiliates.claim_reward': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'mobile_api.register_device': { paramsTuple?: []; params?: {} }
    'mobile_api.validate_token': { paramsTuple?: []; params?: {} }
    'affiliate_dashboard.overview': { paramsTuple?: []; params?: {} }
    'affiliate_dashboard.links': { paramsTuple?: []; params?: {} }
    'affiliate_dashboard.available_campaigns': { paramsTuple?: []; params?: {} }
    'affiliate_dashboard.commissions': { paramsTuple?: []; params?: {} }
    'affiliate_dashboard.payouts': { paramsTuple?: []; params?: {} }
    'affiliate_dashboard.earnings_breakdown': { paramsTuple?: []; params?: {} }
    'affiliate_dashboard.trending': { paramsTuple?: []; params?: {} }
    'affiliate_dashboard.trends': { paramsTuple?: []; params?: {} }
    'vendor_dashboard.overview': { paramsTuple?: []; params?: {} }
    'vendor_dashboard.campaigns': { paramsTuple?: []; params?: {} }
    'vendor_dashboard.top_affiliates': { paramsTuple?: []; params?: {} }
    'vendor_dashboard.financials': { paramsTuple?: []; params?: {} }
    'vendor_dashboard.activity': { paramsTuple?: []; params?: {} }
    'vendor_dashboard.campaign_details': { paramsTuple: [ParamValue]; params: {'campaignId': ParamValue} }
    'vendor_dashboard.earnings_breakdown': { paramsTuple?: []; params?: {} }
    'vendor_dashboard.trends': { paramsTuple?: []; params?: {} }
    'kyc.create_submission': { paramsTuple?: []; params?: {} }
    'kyc.upload_document': { paramsTuple: [ParamValue]; params: {'submissionId': ParamValue} }
    'kyc.get_submission': { paramsTuple: [ParamValue]; params: {'submissionId': ParamValue} }
    'kyc.get_audit_trail': { paramsTuple: [ParamValue]; params: {'submissionId': ParamValue} }
  }
  GET: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'seo.sitemap': { paramsTuple?: []; params?: {} }
    'seo.robots': { paramsTuple?: []; params?: {} }
    'home': { paramsTuple?: []; params?: {} }
    'marketplace': { paramsTuple?: []; params?: {} }
    'reviews': { paramsTuple?: []; params?: {} }
    'product.detail': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'affiliate.redirect': { paramsTuple: [ParamValue]; params: {'link_code': ParamValue} }
    'for.partners': { paramsTuple?: []; params?: {} }
    'privacy': { paramsTuple?: []; params?: {} }
    'track.order': { paramsTuple?: []; params?: {} }
    'legacy.login': { paramsTuple?: []; params?: {} }
    'legacy.register': { paramsTuple?: []; params?: {} }
    'legacy.forgot.password': { paramsTuple?: []; params?: {} }
    'legacy.reset.password': { paramsTuple?: []; params?: {} }
    'legacy.verify.email': { paramsTuple?: []; params?: {} }
    'register': { paramsTuple?: []; params?: {} }
    'login': { paramsTuple?: []; params?: {} }
    'verify.email': { paramsTuple?: []; params?: {} }
    'forgot.password': { paramsTuple?: []; params?: {} }
    'reset.password': { paramsTuple?: []; params?: {} }
    'google.redirect': { paramsTuple?: []; params?: {} }
    'google.callback': { paramsTuple?: []; params?: {} }
    'admin.auth.login': { paramsTuple?: []; params?: {} }
    'admin.auth.setup.google': { paramsTuple?: []; params?: {} }
    'admin.auth.login.google': { paramsTuple?: []; params?: {} }
    'admin.auth.callback': { paramsTuple?: []; params?: {} }
    'admin.dashboard': { paramsTuple?: []; params?: {} }
    'admin.users': { paramsTuple?: []; params?: {} }
    'admin.products': { paramsTuple?: []; params?: {} }
    'admin.orders': { paramsTuple?: []; params?: {} }
    'admin.analytics': { paramsTuple?: []; params?: {} }
    'admin.subscribers': { paramsTuple?: []; params?: {} }
    'admin.blog': { paramsTuple?: []; params?: {} }
    'admin.newsletters': { paramsTuple?: []; params?: {} }
    'admin.newsletter': { paramsTuple?: []; params?: {} }
    'admin.email.campaigns': { paramsTuple?: []; params?: {} }
    'admin.conversions': { paramsTuple?: []; params?: {} }
    'admin.hero.banner': { paramsTuple?: []; params?: {} }
    'admin.payment.settings': { paramsTuple?: []; params?: {} }
    'admin.payouts': { paramsTuple?: []; params?: {} }
    'admin.disputes': { paramsTuple?: []; params?: {} }
    'admin.fraud': { paramsTuple?: []; params?: {} }
    'vendor.dashboard': { paramsTuple?: []; params?: {} }
    'vendor.products': { paramsTuple?: []; params?: {} }
    'vendor.orders': { paramsTuple?: []; params?: {} }
    'vendor.kyc': { paramsTuple?: []; params?: {} }
    'vendor.earnings': { paramsTuple?: []; params?: {} }
    'vendor.analytics': { paramsTuple?: []; params?: {} }
    'vendor.profile': { paramsTuple?: []; params?: {} }
    'vendor.integrations': { paramsTuple?: []; params?: {} }
    'affiliate.dashboard': { paramsTuple?: []; params?: {} }
    'affiliate.products': { paramsTuple?: []; params?: {} }
    'affiliate.campaigns.discover': { paramsTuple?: []; params?: {} }
    'affiliate.links': { paramsTuple?: []; params?: {} }
    'affiliate.earnings': { paramsTuple?: []; params?: {} }
    'affiliate.performance': { paramsTuple?: []; params?: {} }
    'affiliate.profile': { paramsTuple?: []; params?: {} }
    'products.index': { paramsTuple?: []; params?: {} }
    'products.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'campaigns.discover': { paramsTuple?: []; params?: {} }
    'campaigns.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'shopify.handle_callback': { paramsTuple?: []; params?: {} }
    'purchase_destinations.handle_redirect': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'reviews.index': { paramsTuple?: []; params?: {} }
    'currency.list_currencies': { paramsTuple?: []; params?: {} }
    'currency.get_currency': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
    'currency.get_supported_regions': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
    'currency.get_exchange_rate_history': { paramsTuple: [ParamValue,ParamValue]; params: {'from': ParamValue,'to': ParamValue} }
    'site_settings.payment_config': { paramsTuple?: []; params?: {} }
    'payment.providers': { paramsTuple?: []; params?: {} }
    'orders.download_digital_asset': { paramsTuple?: []; params?: {} }
    'affiliates.get_top_performers': { paramsTuple?: []; params?: {} }
    'affiliates.get_affiliates_by_tier': { paramsTuple: [ParamValue]; params: {'tier': ParamValue} }
    'mobile_api.get_app_config': { paramsTuple?: []; params?: {} }
    'mobile_api.get_device_info': { paramsTuple?: []; params?: {} }
    'mobile_api.health_check': { paramsTuple?: []; params?: {} }
    'mobile_api.get_help': { paramsTuple?: []; params?: {} }
    'campaigns.vendor_campaigns': { paramsTuple?: []; params?: {} }
    'campaigns.affiliate_campaigns': { paramsTuple?: []; params?: {} }
    'purchase_destinations.get_stats': { paramsTuple: [ParamValue]; params: {'campaignId': ParamValue} }
    'vendor_conversions.index': { paramsTuple: [ParamValue]; params: {'campaignId': ParamValue} }
    'vendor_conversions.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'vendor_conversions.get_stats': { paramsTuple: [ParamValue]; params: {'campaignId': ParamValue} }
    'commission_ledger.index': { paramsTuple?: []; params?: {} }
    'commission_ledger.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'commission_ledger.get_stats': { paramsTuple?: []; params?: {} }
    'commission_ledger.campaign_stats': { paramsTuple: [ParamValue]; params: {'campaignId': ParamValue} }
    'refunds_chargebacks.index': { paramsTuple?: []; params?: {} }
    'refunds_chargebacks.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'refunds_chargebacks.get_stats': { paramsTuple?: []; params?: {} }
    'orders.index': { paramsTuple?: []; params?: {} }
    'orders.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'affiliate_links.index': { paramsTuple?: []; params?: {} }
    'affiliate_links.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'affiliate_links.metrics': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'affiliate_links.conversions': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'payouts.wallet': { paramsTuple?: []; params?: {} }
    'payouts.history': { paramsTuple?: []; params?: {} }
    'payouts.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'payouts.payment_methods': { paramsTuple?: []; params?: {} }
    'notifications.index': { paramsTuple?: []; params?: {} }
    'notifications.get_unread_count': { paramsTuple?: []; params?: {} }
    'notifications.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_dashboard.overview': { paramsTuple?: []; params?: {} }
    'admin_dashboard.pending_campaigns': { paramsTuple?: []; params?: {} }
    'admin_dashboard.recent_conversions': { paramsTuple?: []; params?: {} }
    'admin_dashboard.users': { paramsTuple?: []; params?: {} }
    'admin_dashboard.commission_stats': { paramsTuple?: []; params?: {} }
    'admin_dashboard.payout_stats': { paramsTuple?: []; params?: {} }
    'admin_dashboard.top_campaigns': { paramsTuple?: []; params?: {} }
    'admin_dashboard.top_affiliates': { paramsTuple?: []; params?: {} }
    'admin_dashboard.financial_overview': { paramsTuple?: []; params?: {} }
    'admin_dashboard.system_health': { paramsTuple?: []; params?: {} }
    'admin_dashboard.platform_activity': { paramsTuple?: []; params?: {} }
    'admin.get_platform_stats': { paramsTuple?: []; params?: {} }
    'admin.auth_status': { paramsTuple?: []; params?: {} }
    'admin.debug_paystack_banks': { paramsTuple?: []; params?: {} }
    'admin_fraud.get_flagged': { paramsTuple?: []; params?: {} }
    'admin_fraud.get_stats': { paramsTuple?: []; params?: {} }
    'admin_dispute.get_disputes': { paramsTuple?: []; params?: {} }
    'admin_dispute.get_dispute': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_dispute.get_stats': { paramsTuple?: []; params?: {} }
    'admin_payout.get_payouts': { paramsTuple?: []; params?: {} }
    'admin_payout.get_banks': { paramsTuple?: []; params?: {} }
    'admin_payout.get_stats': { paramsTuple?: []; params?: {} }
    'fraud_analytics.get_stats': { paramsTuple?: []; params?: {} }
    'fraud_analytics.list_flagged': { paramsTuple?: []; params?: {} }
    'fraud_analytics.get_fraud_details': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'fraud_analytics.get_trends': { paramsTuple?: []; params?: {} }
    'fraud_analytics.get_top_flags': { paramsTuple?: []; params?: {} }
    'analytics.get_metrics': { paramsTuple?: []; params?: {} }
    'analytics.get_summary': { paramsTuple?: []; params?: {} }
    'analytics.list_campaigns': { paramsTuple?: []; params?: {} }
    'analytics.get_campaign_metrics': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'analytics.list_affiliates': { paramsTuple?: []; params?: {} }
    'analytics.get_affiliate_metrics': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'analytics.get_commissions': { paramsTuple?: []; params?: {} }
    'analytics.get_commission_schedule': { paramsTuple?: []; params?: {} }
    'analytics.export_conversions': { paramsTuple?: []; params?: {} }
    'analytics.export_commissions': { paramsTuple?: []; params?: {} }
    'influencers.get_profile': { paramsTuple?: []; params?: {} }
    'influencers.get_stats': { paramsTuple?: []; params?: {} }
    'influencers.list_collaborations': { paramsTuple?: []; params?: {} }
    'influencers.get_collaboration': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'influencers.list_content': { paramsTuple?: []; params?: {} }
    'influencers.get_content_analytics': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'influencers.get_content_performance': { paramsTuple?: []; params?: {} }
    'influencers.list_influencers': { paramsTuple?: []; params?: {} }
    'influencers.view_influencer': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'shopify.get_auth_url': { paramsTuple?: []; params?: {} }
    'shopify.get_store': { paramsTuple?: []; params?: {} }
    'shopify.list_products': { paramsTuple?: []; params?: {} }
    'shopify.list_orders': { paramsTuple?: []; params?: {} }
    'shopify.get_order': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'shopify.get_analytics': { paramsTuple?: []; params?: {} }
    'woocommerce.get_store': { paramsTuple?: []; params?: {} }
    'woocommerce.list_products': { paramsTuple?: []; params?: {} }
    'woocommerce.list_orders': { paramsTuple?: []; params?: {} }
    'woocommerce.get_analytics': { paramsTuple?: []; params?: {} }
    'currency.get_regional_price': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'region': ParamValue} }
    'currency.list_product_pricing': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'payouts.admin_index': { paramsTuple?: []; params?: {} }
    'blog_posts.index': { paramsTuple?: []; params?: {} }
    'newsletter_admin.index': { paramsTuple?: []; params?: {} }
    'email_campaigns.index': { paramsTuple?: []; params?: {} }
    'site_settings.index': { paramsTuple?: []; params?: {} }
    'site_settings.show': { paramsTuple: [ParamValue]; params: {'key': ParamValue} }
    'webhook.get_webhook_endpoints': { paramsTuple?: []; params?: {} }
    'payment_settings.index': { paramsTuple?: []; params?: {} }
    'payment_settings.status_list': { paramsTuple?: []; params?: {} }
    'payment_settings.show': { paramsTuple: [ParamValue]; params: {'gateway': ParamValue} }
    'kyc.list_pending_submissions': { paramsTuple?: []; params?: {} }
    'kyc.get_statistics': { paramsTuple?: []; params?: {} }
    'kyc.search_submissions': { paramsTuple?: []; params?: {} }
    'reports.list_configurations': { paramsTuple?: []; params?: {} }
    'reports.get_configuration': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reports.list_report_logs': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reports.get_report_log': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reports.download_report': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reports.list_schedules': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reports.get_stats': { paramsTuple?: []; params?: {} }
    'disputes.list_open_disputes': { paramsTuple?: []; params?: {} }
    'disputes.list_escalated_disputes': { paramsTuple?: []; params?: {} }
    'disputes.filter_disputes': { paramsTuple?: []; params?: {} }
    'disputes.get_dashboard_stats': { paramsTuple?: []; params?: {} }
    'affiliates.list_campaigns': { paramsTuple?: []; params?: {} }
    'disputes.list_user_disputes': { paramsTuple?: []; params?: {} }
    'disputes.get_dispute': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'disputes.get_comments': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'amazon.get_auth_url': { paramsTuple?: []; params?: {} }
    'amazon.handle_callback': { paramsTuple?: []; params?: {} }
    'amazon.list_accounts': { paramsTuple?: []; params?: {} }
    'amazon.get_campaigns': { paramsTuple?: []; params?: {} }
    'etsy.get_auth_url': { paramsTuple?: []; params?: {} }
    'etsy.handle_callback': { paramsTuple?: []; params?: {} }
    'etsy.list_shops': { paramsTuple?: []; params?: {} }
    'etsy.get_listings': { paramsTuple?: []; params?: {} }
    'etsy.get_orders': { paramsTuple?: []; params?: {} }
    'affiliates.get_profile': { paramsTuple?: []; params?: {} }
    'affiliates.get_referral_codes': { paramsTuple?: []; params?: {} }
    'affiliates.get_referral_code_performance': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'affiliates.get_referrals': { paramsTuple?: []; params?: {} }
    'affiliates.get_rewards': { paramsTuple?: []; params?: {} }
    'affiliate_dashboard.overview': { paramsTuple?: []; params?: {} }
    'affiliate_dashboard.links': { paramsTuple?: []; params?: {} }
    'affiliate_dashboard.available_campaigns': { paramsTuple?: []; params?: {} }
    'affiliate_dashboard.commissions': { paramsTuple?: []; params?: {} }
    'affiliate_dashboard.payouts': { paramsTuple?: []; params?: {} }
    'affiliate_dashboard.earnings_breakdown': { paramsTuple?: []; params?: {} }
    'affiliate_dashboard.trending': { paramsTuple?: []; params?: {} }
    'affiliate_dashboard.trends': { paramsTuple?: []; params?: {} }
    'vendor_dashboard.overview': { paramsTuple?: []; params?: {} }
    'vendor_dashboard.campaigns': { paramsTuple?: []; params?: {} }
    'vendor_dashboard.top_affiliates': { paramsTuple?: []; params?: {} }
    'vendor_dashboard.financials': { paramsTuple?: []; params?: {} }
    'vendor_dashboard.activity': { paramsTuple?: []; params?: {} }
    'vendor_dashboard.campaign_details': { paramsTuple: [ParamValue]; params: {'campaignId': ParamValue} }
    'vendor_dashboard.earnings_breakdown': { paramsTuple?: []; params?: {} }
    'vendor_dashboard.trends': { paramsTuple?: []; params?: {} }
    'kyc.get_submission': { paramsTuple: [ParamValue]; params: {'submissionId': ParamValue} }
    'kyc.get_audit_trail': { paramsTuple: [ParamValue]; params: {'submissionId': ParamValue} }
  }
  HEAD: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'seo.sitemap': { paramsTuple?: []; params?: {} }
    'seo.robots': { paramsTuple?: []; params?: {} }
    'home': { paramsTuple?: []; params?: {} }
    'marketplace': { paramsTuple?: []; params?: {} }
    'reviews': { paramsTuple?: []; params?: {} }
    'product.detail': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'affiliate.redirect': { paramsTuple: [ParamValue]; params: {'link_code': ParamValue} }
    'for.partners': { paramsTuple?: []; params?: {} }
    'privacy': { paramsTuple?: []; params?: {} }
    'track.order': { paramsTuple?: []; params?: {} }
    'legacy.login': { paramsTuple?: []; params?: {} }
    'legacy.register': { paramsTuple?: []; params?: {} }
    'legacy.forgot.password': { paramsTuple?: []; params?: {} }
    'legacy.reset.password': { paramsTuple?: []; params?: {} }
    'legacy.verify.email': { paramsTuple?: []; params?: {} }
    'register': { paramsTuple?: []; params?: {} }
    'login': { paramsTuple?: []; params?: {} }
    'verify.email': { paramsTuple?: []; params?: {} }
    'forgot.password': { paramsTuple?: []; params?: {} }
    'reset.password': { paramsTuple?: []; params?: {} }
    'google.redirect': { paramsTuple?: []; params?: {} }
    'google.callback': { paramsTuple?: []; params?: {} }
    'admin.auth.login': { paramsTuple?: []; params?: {} }
    'admin.auth.setup.google': { paramsTuple?: []; params?: {} }
    'admin.auth.login.google': { paramsTuple?: []; params?: {} }
    'admin.auth.callback': { paramsTuple?: []; params?: {} }
    'admin.dashboard': { paramsTuple?: []; params?: {} }
    'admin.users': { paramsTuple?: []; params?: {} }
    'admin.products': { paramsTuple?: []; params?: {} }
    'admin.orders': { paramsTuple?: []; params?: {} }
    'admin.analytics': { paramsTuple?: []; params?: {} }
    'admin.subscribers': { paramsTuple?: []; params?: {} }
    'admin.blog': { paramsTuple?: []; params?: {} }
    'admin.newsletters': { paramsTuple?: []; params?: {} }
    'admin.newsletter': { paramsTuple?: []; params?: {} }
    'admin.email.campaigns': { paramsTuple?: []; params?: {} }
    'admin.conversions': { paramsTuple?: []; params?: {} }
    'admin.hero.banner': { paramsTuple?: []; params?: {} }
    'admin.payment.settings': { paramsTuple?: []; params?: {} }
    'admin.payouts': { paramsTuple?: []; params?: {} }
    'admin.disputes': { paramsTuple?: []; params?: {} }
    'admin.fraud': { paramsTuple?: []; params?: {} }
    'vendor.dashboard': { paramsTuple?: []; params?: {} }
    'vendor.products': { paramsTuple?: []; params?: {} }
    'vendor.orders': { paramsTuple?: []; params?: {} }
    'vendor.kyc': { paramsTuple?: []; params?: {} }
    'vendor.earnings': { paramsTuple?: []; params?: {} }
    'vendor.analytics': { paramsTuple?: []; params?: {} }
    'vendor.profile': { paramsTuple?: []; params?: {} }
    'vendor.integrations': { paramsTuple?: []; params?: {} }
    'affiliate.dashboard': { paramsTuple?: []; params?: {} }
    'affiliate.products': { paramsTuple?: []; params?: {} }
    'affiliate.campaigns.discover': { paramsTuple?: []; params?: {} }
    'affiliate.links': { paramsTuple?: []; params?: {} }
    'affiliate.earnings': { paramsTuple?: []; params?: {} }
    'affiliate.performance': { paramsTuple?: []; params?: {} }
    'affiliate.profile': { paramsTuple?: []; params?: {} }
    'products.index': { paramsTuple?: []; params?: {} }
    'products.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'campaigns.discover': { paramsTuple?: []; params?: {} }
    'campaigns.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'shopify.handle_callback': { paramsTuple?: []; params?: {} }
    'purchase_destinations.handle_redirect': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'reviews.index': { paramsTuple?: []; params?: {} }
    'currency.list_currencies': { paramsTuple?: []; params?: {} }
    'currency.get_currency': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
    'currency.get_supported_regions': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
    'currency.get_exchange_rate_history': { paramsTuple: [ParamValue,ParamValue]; params: {'from': ParamValue,'to': ParamValue} }
    'site_settings.payment_config': { paramsTuple?: []; params?: {} }
    'payment.providers': { paramsTuple?: []; params?: {} }
    'orders.download_digital_asset': { paramsTuple?: []; params?: {} }
    'affiliates.get_top_performers': { paramsTuple?: []; params?: {} }
    'affiliates.get_affiliates_by_tier': { paramsTuple: [ParamValue]; params: {'tier': ParamValue} }
    'mobile_api.get_app_config': { paramsTuple?: []; params?: {} }
    'mobile_api.get_device_info': { paramsTuple?: []; params?: {} }
    'mobile_api.health_check': { paramsTuple?: []; params?: {} }
    'mobile_api.get_help': { paramsTuple?: []; params?: {} }
    'campaigns.vendor_campaigns': { paramsTuple?: []; params?: {} }
    'campaigns.affiliate_campaigns': { paramsTuple?: []; params?: {} }
    'purchase_destinations.get_stats': { paramsTuple: [ParamValue]; params: {'campaignId': ParamValue} }
    'vendor_conversions.index': { paramsTuple: [ParamValue]; params: {'campaignId': ParamValue} }
    'vendor_conversions.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'vendor_conversions.get_stats': { paramsTuple: [ParamValue]; params: {'campaignId': ParamValue} }
    'commission_ledger.index': { paramsTuple?: []; params?: {} }
    'commission_ledger.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'commission_ledger.get_stats': { paramsTuple?: []; params?: {} }
    'commission_ledger.campaign_stats': { paramsTuple: [ParamValue]; params: {'campaignId': ParamValue} }
    'refunds_chargebacks.index': { paramsTuple?: []; params?: {} }
    'refunds_chargebacks.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'refunds_chargebacks.get_stats': { paramsTuple?: []; params?: {} }
    'orders.index': { paramsTuple?: []; params?: {} }
    'orders.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'affiliate_links.index': { paramsTuple?: []; params?: {} }
    'affiliate_links.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'affiliate_links.metrics': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'affiliate_links.conversions': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'payouts.wallet': { paramsTuple?: []; params?: {} }
    'payouts.history': { paramsTuple?: []; params?: {} }
    'payouts.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'payouts.payment_methods': { paramsTuple?: []; params?: {} }
    'notifications.index': { paramsTuple?: []; params?: {} }
    'notifications.get_unread_count': { paramsTuple?: []; params?: {} }
    'notifications.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_dashboard.overview': { paramsTuple?: []; params?: {} }
    'admin_dashboard.pending_campaigns': { paramsTuple?: []; params?: {} }
    'admin_dashboard.recent_conversions': { paramsTuple?: []; params?: {} }
    'admin_dashboard.users': { paramsTuple?: []; params?: {} }
    'admin_dashboard.commission_stats': { paramsTuple?: []; params?: {} }
    'admin_dashboard.payout_stats': { paramsTuple?: []; params?: {} }
    'admin_dashboard.top_campaigns': { paramsTuple?: []; params?: {} }
    'admin_dashboard.top_affiliates': { paramsTuple?: []; params?: {} }
    'admin_dashboard.financial_overview': { paramsTuple?: []; params?: {} }
    'admin_dashboard.system_health': { paramsTuple?: []; params?: {} }
    'admin_dashboard.platform_activity': { paramsTuple?: []; params?: {} }
    'admin.get_platform_stats': { paramsTuple?: []; params?: {} }
    'admin.auth_status': { paramsTuple?: []; params?: {} }
    'admin.debug_paystack_banks': { paramsTuple?: []; params?: {} }
    'admin_fraud.get_flagged': { paramsTuple?: []; params?: {} }
    'admin_fraud.get_stats': { paramsTuple?: []; params?: {} }
    'admin_dispute.get_disputes': { paramsTuple?: []; params?: {} }
    'admin_dispute.get_dispute': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_dispute.get_stats': { paramsTuple?: []; params?: {} }
    'admin_payout.get_payouts': { paramsTuple?: []; params?: {} }
    'admin_payout.get_banks': { paramsTuple?: []; params?: {} }
    'admin_payout.get_stats': { paramsTuple?: []; params?: {} }
    'fraud_analytics.get_stats': { paramsTuple?: []; params?: {} }
    'fraud_analytics.list_flagged': { paramsTuple?: []; params?: {} }
    'fraud_analytics.get_fraud_details': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'fraud_analytics.get_trends': { paramsTuple?: []; params?: {} }
    'fraud_analytics.get_top_flags': { paramsTuple?: []; params?: {} }
    'analytics.get_metrics': { paramsTuple?: []; params?: {} }
    'analytics.get_summary': { paramsTuple?: []; params?: {} }
    'analytics.list_campaigns': { paramsTuple?: []; params?: {} }
    'analytics.get_campaign_metrics': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'analytics.list_affiliates': { paramsTuple?: []; params?: {} }
    'analytics.get_affiliate_metrics': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'analytics.get_commissions': { paramsTuple?: []; params?: {} }
    'analytics.get_commission_schedule': { paramsTuple?: []; params?: {} }
    'analytics.export_conversions': { paramsTuple?: []; params?: {} }
    'analytics.export_commissions': { paramsTuple?: []; params?: {} }
    'influencers.get_profile': { paramsTuple?: []; params?: {} }
    'influencers.get_stats': { paramsTuple?: []; params?: {} }
    'influencers.list_collaborations': { paramsTuple?: []; params?: {} }
    'influencers.get_collaboration': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'influencers.list_content': { paramsTuple?: []; params?: {} }
    'influencers.get_content_analytics': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'influencers.get_content_performance': { paramsTuple?: []; params?: {} }
    'influencers.list_influencers': { paramsTuple?: []; params?: {} }
    'influencers.view_influencer': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'shopify.get_auth_url': { paramsTuple?: []; params?: {} }
    'shopify.get_store': { paramsTuple?: []; params?: {} }
    'shopify.list_products': { paramsTuple?: []; params?: {} }
    'shopify.list_orders': { paramsTuple?: []; params?: {} }
    'shopify.get_order': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'shopify.get_analytics': { paramsTuple?: []; params?: {} }
    'woocommerce.get_store': { paramsTuple?: []; params?: {} }
    'woocommerce.list_products': { paramsTuple?: []; params?: {} }
    'woocommerce.list_orders': { paramsTuple?: []; params?: {} }
    'woocommerce.get_analytics': { paramsTuple?: []; params?: {} }
    'currency.get_regional_price': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'region': ParamValue} }
    'currency.list_product_pricing': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'payouts.admin_index': { paramsTuple?: []; params?: {} }
    'blog_posts.index': { paramsTuple?: []; params?: {} }
    'newsletter_admin.index': { paramsTuple?: []; params?: {} }
    'email_campaigns.index': { paramsTuple?: []; params?: {} }
    'site_settings.index': { paramsTuple?: []; params?: {} }
    'site_settings.show': { paramsTuple: [ParamValue]; params: {'key': ParamValue} }
    'webhook.get_webhook_endpoints': { paramsTuple?: []; params?: {} }
    'payment_settings.index': { paramsTuple?: []; params?: {} }
    'payment_settings.status_list': { paramsTuple?: []; params?: {} }
    'payment_settings.show': { paramsTuple: [ParamValue]; params: {'gateway': ParamValue} }
    'kyc.list_pending_submissions': { paramsTuple?: []; params?: {} }
    'kyc.get_statistics': { paramsTuple?: []; params?: {} }
    'kyc.search_submissions': { paramsTuple?: []; params?: {} }
    'reports.list_configurations': { paramsTuple?: []; params?: {} }
    'reports.get_configuration': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reports.list_report_logs': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reports.get_report_log': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reports.download_report': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reports.list_schedules': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reports.get_stats': { paramsTuple?: []; params?: {} }
    'disputes.list_open_disputes': { paramsTuple?: []; params?: {} }
    'disputes.list_escalated_disputes': { paramsTuple?: []; params?: {} }
    'disputes.filter_disputes': { paramsTuple?: []; params?: {} }
    'disputes.get_dashboard_stats': { paramsTuple?: []; params?: {} }
    'affiliates.list_campaigns': { paramsTuple?: []; params?: {} }
    'disputes.list_user_disputes': { paramsTuple?: []; params?: {} }
    'disputes.get_dispute': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'disputes.get_comments': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'amazon.get_auth_url': { paramsTuple?: []; params?: {} }
    'amazon.handle_callback': { paramsTuple?: []; params?: {} }
    'amazon.list_accounts': { paramsTuple?: []; params?: {} }
    'amazon.get_campaigns': { paramsTuple?: []; params?: {} }
    'etsy.get_auth_url': { paramsTuple?: []; params?: {} }
    'etsy.handle_callback': { paramsTuple?: []; params?: {} }
    'etsy.list_shops': { paramsTuple?: []; params?: {} }
    'etsy.get_listings': { paramsTuple?: []; params?: {} }
    'etsy.get_orders': { paramsTuple?: []; params?: {} }
    'affiliates.get_profile': { paramsTuple?: []; params?: {} }
    'affiliates.get_referral_codes': { paramsTuple?: []; params?: {} }
    'affiliates.get_referral_code_performance': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'affiliates.get_referrals': { paramsTuple?: []; params?: {} }
    'affiliates.get_rewards': { paramsTuple?: []; params?: {} }
    'affiliate_dashboard.overview': { paramsTuple?: []; params?: {} }
    'affiliate_dashboard.links': { paramsTuple?: []; params?: {} }
    'affiliate_dashboard.available_campaigns': { paramsTuple?: []; params?: {} }
    'affiliate_dashboard.commissions': { paramsTuple?: []; params?: {} }
    'affiliate_dashboard.payouts': { paramsTuple?: []; params?: {} }
    'affiliate_dashboard.earnings_breakdown': { paramsTuple?: []; params?: {} }
    'affiliate_dashboard.trending': { paramsTuple?: []; params?: {} }
    'affiliate_dashboard.trends': { paramsTuple?: []; params?: {} }
    'vendor_dashboard.overview': { paramsTuple?: []; params?: {} }
    'vendor_dashboard.campaigns': { paramsTuple?: []; params?: {} }
    'vendor_dashboard.top_affiliates': { paramsTuple?: []; params?: {} }
    'vendor_dashboard.financials': { paramsTuple?: []; params?: {} }
    'vendor_dashboard.activity': { paramsTuple?: []; params?: {} }
    'vendor_dashboard.campaign_details': { paramsTuple: [ParamValue]; params: {'campaignId': ParamValue} }
    'vendor_dashboard.earnings_breakdown': { paramsTuple?: []; params?: {} }
    'vendor_dashboard.trends': { paramsTuple?: []; params?: {} }
    'kyc.get_submission': { paramsTuple: [ParamValue]; params: {'submissionId': ParamValue} }
    'kyc.get_audit_trail': { paramsTuple: [ParamValue]; params: {'submissionId': ParamValue} }
  }
  POST: {
    'new_account.store': { paramsTuple?: []; params?: {} }
    'new_account.register_step_1': { paramsTuple?: []; params?: {} }
    'new_account.register_step_2': { paramsTuple?: []; params?: {} }
    'new_account.register_step_3': { paramsTuple?: []; params?: {} }
    'new_account.verify_otp': { paramsTuple?: []; params?: {} }
    'new_account.resend_otp': { paramsTuple?: []; params?: {} }
    'new_account.login': { paramsTuple?: []; params?: {} }
    'new_account.forgot_password': { paramsTuple?: []; params?: {} }
    'new_account.reset_password': { paramsTuple?: []; params?: {} }
    'logout': { paramsTuple?: []; params?: {} }
    'newsletters.subscribe': { paramsTuple?: []; params?: {} }
    'newsletters.unsubscribe': { paramsTuple?: []; params?: {} }
    'affiliate_links.track_click': { paramsTuple?: []; params?: {} }
    'currency.convert_currency': { paramsTuple?: []; params?: {} }
    'payment.initialize': { paramsTuple?: []; params?: {} }
    'payment.verify': { paramsTuple?: []; params?: {} }
    'orders.track_order': { paramsTuple?: []; params?: {} }
    'mobile_api.report_error': { paramsTuple?: []; params?: {} }
    'webhook.stripe_webhook': { paramsTuple?: []; params?: {} }
    'webhook.paystack_webhook': { paramsTuple?: []; params?: {} }
    'webhook.flutterwave_webhook': { paramsTuple?: []; params?: {} }
    'webhook.paypal_webhook': { paramsTuple?: []; params?: {} }
    'webhook.handle_webhook': { paramsTuple: [ParamValue]; params: {'provider': ParamValue} }
    'products.store': { paramsTuple?: []; params?: {} }
    'campaigns.create': { paramsTuple?: []; params?: {} }
    'campaigns.submit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'campaigns.pause': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'campaigns.resume': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'campaigns.join': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'purchase_destinations.generate_redirect_link': { paramsTuple: [ParamValue]; params: {'campaignId': ParamValue} }
    'purchase_destinations.record_conversion': { paramsTuple: [ParamValue]; params: {'campaignId': ParamValue} }
    'vendor_conversions.report_conversion': { paramsTuple: [ParamValue]; params: {'campaignId': ParamValue} }
    'vendor_conversions.dispute': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'commission_ledger.dispute': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'refunds_chargebacks.report': { paramsTuple?: []; params?: {} }
    'orders.process_order': { paramsTuple?: []; params?: {} }
    'orders.notify_vendor': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'affiliate_links.create': { paramsTuple?: []; params?: {} }
    'affiliate_links.track_click_slug': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'affiliate_links.report_conversion': { paramsTuple?: []; params?: {} }
    'reviews.store': { paramsTuple?: []; params?: {} }
    'profile.upload_image': { paramsTuple?: []; params?: {} }
    'upload.upload_product_image': { paramsTuple?: []; params?: {} }
    'upload.upload_product_gallery': { paramsTuple?: []; params?: {} }
    'upload.upload_digital_asset': { paramsTuple?: []; params?: {} }
    'upload.upload_profile_image': { paramsTuple?: []; params?: {} }
    'upload.upload_admin_image': { paramsTuple?: []; params?: {} }
    'upload.upload_video': { paramsTuple?: []; params?: {} }
    'upload.upload_document': { paramsTuple?: []; params?: {} }
    'upload.upload_file': { paramsTuple?: []; params?: {} }
    'payouts.request_payout': { paramsTuple?: []; params?: {} }
    'payouts.add_payment_method': { paramsTuple?: []; params?: {} }
    'admin.test_email': { paramsTuple?: []; params?: {} }
    'campaigns.approve': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'campaigns.reject': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'vendor_conversions.reverse': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'commission_ledger.approve': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'commission_ledger.reject': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'commission_ledger.mark_as_paid': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'commission_ledger.bulk_approve': { paramsTuple?: []; params?: {} }
    'refunds_chargebacks.verify': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'refunds_chargebacks.approve': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'refunds_chargebacks.reject': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'refunds_chargebacks.complete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_fraud.approve_conversion': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_fraud.reject_conversion': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_fraud.analyze_conversion': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_dispute.add_evidence': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_dispute.escalate_dispute': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_dispute.resolve_dispute': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_dispute.auto_resolve': { paramsTuple?: []; params?: {} }
    'admin_payout.check_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_payout.verify_bank_account': { paramsTuple?: []; params?: {} }
    'admin_payout.handle_webhook': { paramsTuple?: []; params?: {} }
    'fraud_analytics.approve_fraud_flag': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'fraud_analytics.reject_fraud_flag': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'fraud_analytics.auto_reject_high_risk': { paramsTuple?: []; params?: {} }
    'influencers.create_profile': { paramsTuple?: []; params?: {} }
    'influencers.accept_collaboration': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'influencers.create_content': { paramsTuple?: []; params?: {} }
    'influencers.verify_influencer': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'influencers.reject_influencer': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'shopify.disconnect': { paramsTuple?: []; params?: {} }
    'shopify.sync_products': { paramsTuple?: []; params?: {} }
    'shopify.sync_orders': { paramsTuple?: []; params?: {} }
    'shopify.calculate_commissions': { paramsTuple?: []; params?: {} }
    'woocommerce.connect': { paramsTuple?: []; params?: {} }
    'woocommerce.disconnect': { paramsTuple?: []; params?: {} }
    'woocommerce.sync_products': { paramsTuple?: []; params?: {} }
    'woocommerce.sync_orders': { paramsTuple?: []; params?: {} }
    'woocommerce.calculate_commissions': { paramsTuple?: []; params?: {} }
    'currency.format_amount': { paramsTuple?: []; params?: {} }
    'currency.set_regional_pricing': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'currency.update_exchange_rates': { paramsTuple?: []; params?: {} }
    'reviews.approve': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'payouts.approve': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'payouts.reject': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'payouts.process': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'payouts.complete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'payouts.fail': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'blog_posts.store': { paramsTuple?: []; params?: {} }
    'newsletter_admin.store': { paramsTuple?: []; params?: {} }
    'email_campaigns.store': { paramsTuple?: []; params?: {} }
    'site_settings.upsert': { paramsTuple?: []; params?: {} }
    'site_settings.upload_image': { paramsTuple?: []; params?: {} }
    'webhook.test_webhook': { paramsTuple: [ParamValue]; params: {'provider': ParamValue} }
    'payment_settings.store': { paramsTuple?: []; params?: {} }
    'kyc.verify_document': { paramsTuple: [ParamValue,ParamValue]; params: {'submissionId': ParamValue,'documentId': ParamValue} }
    'kyc.assess_risk': { paramsTuple: [ParamValue]; params: {'submissionId': ParamValue} }
    'kyc.check_compliance': { paramsTuple: [ParamValue]; params: {'submissionId': ParamValue} }
    'kyc.approve_submission': { paramsTuple: [ParamValue]; params: {'submissionId': ParamValue} }
    'kyc.reject_submission': { paramsTuple: [ParamValue]; params: {'submissionId': ParamValue} }
    'reports.create_configuration': { paramsTuple?: []; params?: {} }
    'reports.generate_report': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reports.create_schedule': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reports.archive_report': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'disputes.update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'disputes.resolve_dispute': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'disputes.assign_dispute': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'disputes.escalate_dispute': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'disputes.request_approval': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'disputes.approve_dispute': { paramsTuple: [ParamValue]; params: {'approvalId': ParamValue} }
    'disputes.reject_dispute': { paramsTuple: [ParamValue]; params: {'approvalId': ParamValue} }
    'affiliates.create_campaign': { paramsTuple?: []; params?: {} }
    'affiliates.launch_campaign': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'affiliates.complete_campaign': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'disputes.file_dispute': { paramsTuple?: []; params?: {} }
    'disputes.add_comment': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'affiliates.create_profile': { paramsTuple?: []; params?: {} }
    'affiliates.generate_referral_code': { paramsTuple?: []; params?: {} }
    'affiliates.claim_reward': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'mobile_api.register_device': { paramsTuple?: []; params?: {} }
    'mobile_api.validate_token': { paramsTuple?: []; params?: {} }
    'kyc.create_submission': { paramsTuple?: []; params?: {} }
    'kyc.upload_document': { paramsTuple: [ParamValue]; params: {'submissionId': ParamValue} }
  }
  PUT: {
    'products.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'campaigns.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'purchase_destinations.configure_campaign_destination': { paramsTuple: [ParamValue]; params: {'campaignId': ParamValue} }
    'vendor.orders.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'affiliate_links.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'profile.update_affiliate': { paramsTuple?: []; params?: {} }
    'profile.update_vendor': { paramsTuple?: []; params?: {} }
    'products.approve': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'vendor_conversions.approve': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'vendor_conversions.reject': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'influencers.update_profile': { paramsTuple?: []; params?: {} }
    'influencers.update_content': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'shopify.update_product': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'woocommerce.update_product': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.update_user': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'blog_posts.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'newsletter_admin.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'email_campaigns.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'payment_settings.update': { paramsTuple: [ParamValue]; params: {'gateway': ParamValue} }
    'reports.update_configuration': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reports.update_schedule': { paramsTuple: [ParamValue]; params: {'scheduleId': ParamValue} }
    'affiliates.update_profile': { paramsTuple?: []; params?: {} }
  }
  DELETE: {
    'products.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'affiliate_links.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'notifications.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'notifications.destroy_all': { paramsTuple?: []; params?: {} }
    'admin.delete_user': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'blog_posts.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'newsletter_admin.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'email_campaigns.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'payment_settings.destroy': { paramsTuple: [ParamValue]; params: {'gateway': ParamValue} }
    'reports.delete_configuration': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reports.delete_schedule': { paramsTuple: [ParamValue]; params: {'scheduleId': ParamValue} }
  }
  PATCH: {
    'notifications.mark_as_read': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'notifications.mark_all_as_read': { paramsTuple?: []; params?: {} }
    'payment_settings.toggle': { paramsTuple: [ParamValue]; params: {'gateway': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}