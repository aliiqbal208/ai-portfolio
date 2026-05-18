import unittest
from unittest.mock import patch, MagicMock
from scripts import clamav_scanner as cs

class TestClamAVScanner(unittest.TestCase):
    def test_no_engine(self):
        with patch('scripts.clamav_scanner.which_engine', return_value=('', [])):
            res = cs.run_scan(['.'])
            self.assertEqual(res.raw_exit_code, 2)
            self.assertIn('ClamAV not installed', ' '.join(res.errors))

    def test_clamscan_clean(self):
        with patch('scripts.clamav_scanner.which_engine', return_value=('clamscan', ['clamscan', '--no-summary', '-i', '--recursive=yes'])):
            with patch('subprocess.run') as run:
                proc = MagicMock()
                proc.returncode = 0
                proc.stdout = '/tmp/foo: OK\n/tmp/bar: OK\n----------- SCAN SUMMARY -----------\nKnown viruses: 123\n'
                run.return_value = proc
                res = cs.run_scan(['/tmp'])
                self.assertTrue(res.clean)
                self.assertEqual(res.infected, 0)
                self.assertEqual(res.scanned, 2)

    def test_clamscan_infected(self):
        with patch('scripts.clamav_scanner.which_engine', return_value=('clamscan', ['clamscan', '--no-summary', '-i', '--recursive=yes'])):
            with patch('subprocess.run') as run:
                proc = MagicMock()
                proc.returncode = 1
                proc.stdout = '/tmp/eicar.txt: Eicar-Test-Signature FOUND\n/tmp/ok: OK\n'
                run.return_value = proc
                res = cs.run_scan(['/tmp'])
                self.assertFalse(res.clean)
                self.assertEqual(res.infected, 1)
                self.assertEqual(res.scanned, 2)
                self.assertEqual(res.findings[0].signature, 'Eicar-Test-Signature')

    def test_timeout(self):
        with patch('scripts.clamav_scanner.which_engine', return_value=('clamscan', ['clamscan', '--no-summary', '-i', '--recursive=yes'])):
            import subprocess as sp
            with patch('subprocess.run', side_effect=sp.TimeoutExpired(cmd='clamscan', timeout=1)):
                res = cs.run_scan(['/tmp'], timeout=1)
                self.assertEqual(res.raw_exit_code, 2)
                self.assertIn('Timeout', ' '.join(res.errors))

if __name__ == '__main__':
    unittest.main()
