import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { LOGO_DATA_URI } from '@/lib/logo';

const styles = StyleSheet.create({
  page: {
    padding: 50,
    backgroundColor: '#FDF8F0',
  },
  border: {
    border: '3 double #D4A853',
    borderRadius: 8,
    padding: 40,
  },
  header: {
    textAlign: 'center',
    marginBottom: 30,
  },
  logoImg: {
    width: 70,
    height: 70,
    marginBottom: 8,
    alignSelf: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 600,
    color: '#B8860B',
    marginBottom: 6,
    textTransform: 'uppercase' as const,
    letterSpacing: 3,
  },
  subtitle: {
    fontSize: 16,
    color: '#5C4033',
    marginBottom: 4,
  },
  certText: {
    fontSize: 10,
    color: '#A0806E',
  },
  body: {
    textAlign: 'center',
    marginVertical: 30,
  },
  certHeading: {
    fontSize: 18,
    fontWeight: 600,
    color: '#5C4033',
    marginBottom: 20,
    textTransform: 'uppercase' as const,
    letterSpacing: 2,
  },
  statement: {
    fontSize: 11,
    color: '#5C4033',
    lineHeight: 2,
    marginBottom: 10,
  },
  detailsBox: {
    marginVertical: 20,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    border: '1 solid #E8C97A',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 10,
    color: '#A0806E',
    width: 120,
    textAlign: 'right' as const,
    marginRight: 10,
  },
  detailValue: {
    fontSize: 11,
    color: '#5C4033',
    fontWeight: 600,
    textAlign: 'left' as const,
    width: 200,
  },
  footer: {
    marginTop: 40,
    textAlign: 'center',
  },
  signature: {
    marginTop: 30,
    borderTop: '1 solid #5C4033',
    paddingTop: 8,
    alignSelf: 'center',
  },
  signText: {
    fontSize: 10,
    color: '#5C4033',
  },
  watermark: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 8,
    color: '#D4A853',
    opacity: 0.5,
  },
});

interface MatchCertificateProps {
  brideProfile: any;
  groomProfile: any;
  match: any;
}

export function MatchCertificate({ brideProfile, groomProfile, match }: MatchCertificateProps) {
  const date = match.confirmed_date
    ? new Date(match.confirmed_date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.border}>
          <View style={styles.header}>
            <Image src={LOGO_DATA_URI} style={styles.logoImg} />
            <Text style={styles.title}>Sana Rani Matrimony</Text>
            <Text style={styles.subtitle}>Match Facilitation Certificate</Text>
            <Text style={styles.certText}>Trusted Matchmaking Service</Text>
          </View>

          <View style={styles.body}>
            <Text style={styles.certHeading}>Certificate of Match Facilitation</Text>

            <Text style={styles.statement}>
              This is to certify that the following profiles were exchanged through
              Sana Rani Matrimony, and both parties have mutually agreed to the match.
            </Text>

            <View style={styles.detailsBox}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Bride Profile:</Text>
                <Text style={styles.detailValue}>{brideProfile?.full_name} ({brideProfile?.profile_id})</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Groom Profile:</Text>
                <Text style={styles.detailValue}>{groomProfile?.full_name} ({groomProfile?.profile_id})</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date Confirmed:</Text>
                <Text style={styles.detailValue}>{date}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Match Reference:</Text>
                <Text style={styles.detailValue}>{match.id?.slice(0, 8)?.toUpperCase()}</Text>
              </View>
            </View>

            <Text style={styles.statement}>
              We confirm that the biodata of both parties were shared through our platform,
              and the match has been facilitated by Sana Rani Matrimony.
            </Text>
          </View>

          <View style={styles.footer}>
            <View style={styles.signature}>
              <Text style={styles.signText}>Sana Rani</Text>
              <Text style={{ ...styles.signText, color: '#A0806E', fontSize: 9 }}>Founder, Sana Rani Matrimony</Text>
            </View>
          </View>

          <Text style={styles.watermark}>Sana Rani Matrimony — Official Document</Text>
        </View>
      </Page>
    </Document>
  );
}
